import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, waitForProperty, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import Papa from 'papaparse';
import { select } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import $ from 'jquery';
import moment from 'moment';
import textSizes from 'manifesto/tailwind/config/text-sizes';

import {
  array,
  raw,
  subtract,
  add,
  hash,
  math,
  multiply
} from 'ember-awesome-macros';

export default Component.extend({
  tagName: 'svg',

  classNames: [
    'w-full'
  ],

  init() {
    this._super(...arguments);
    this.loadDataTask.perform();
  },

  didInsertElement() {
    this.drawChartTask.perform();
    this.resizeService.on('debouncedDidResize', () => {
      this.drawChartTask.perform();
    });
  },

  fastboot: service(),

  assetMap: service(),

  loadDataTask: task(function * () {
    let csv;
    if (this.fastboot.isFastBoot) {
      const fs = FastBoot.require('fs');
      const path = FastBoot.require('path');
      const jsonPath = path.resolve('public','assets', 'data', 'weight-measurements.csv');
      csv = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
    } else {
      const response = yield fetch('/assets/data/weight-measurements.csv');
      if (response.status === 200) {
        csv = yield response.text();
      }
    }
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    const data = parsed.data.map((d) => {
      return {
        date: moment(d.date, 'M/D/YYYY').toDate(),
        weight: Number(d.weight)
      };
    });
    this.set('data', data);
  }),

  dates: array.sort(array.mapBy('data', raw('date')), (a,b) => a < b ? -1 : 1),

  weights: array.sort(array.mapBy('data', raw('weight'))),

  weightPadding: 10,

  weightAxis: hash({
    min: subtract(array.first('weights'), 'weightPadding'),
    max: add(array.last('weights'), 'weightPadding'),
  }),

  dateAxis: hash({
    min: array.first('dates'),
    max: array.last('dates'),
  }),

  padding: raw({
    top: 25,
    right: 25,
    bottom: 25,
    left: 40,
  }),

  innerWidth: computed('width', 'padding.{left,right}', function() {
    const { width, padding: { left, right } } = this;
    return width - left - right;
  }),

  drawChartTask: task(function * () {
    yield waitForProperty(this, 'data', v => isPresent(v));
    this.set('svg', select(this.element));
    this.resetChart();
    this.drawYAxis();
    this.drawXAxis();
    this.drawWeightsSeries();
    this.drawPhotoMarkers();
    this.loadPhotos();
    this.playPhotosTask.perform();
  }),

  playPhotosTask: task(function * () {
    yield timeout(3000);
    for (let i = 0; i < this.photoDates.length; i++) {
      const date = this.photoDates[i];
      this.showPhoto(date);
      yield timeout(1000);
    }
    this.removePhoto(this.selectedPhoto);
  }).restartable(),

  resetChart() {
    this.svg.selectAll("*").remove();
    this.setProperties({
      height: $(this.element).width() / 2,
      width: $(this.element).width(),
    });

    this.svg
      .attr('viewbox', `0 0 ${this.height} ${this.width}`)
      .attr('height', this.height);
  },

  findWeight(date) {
    const { data } = this;
    let cb, ca;
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      if (datum.date <= date) {
        cb = datum.weight;
      } else {
        ca = datum.weight;
        break;
      }
    }
    if (!ca) ca = cb;
    return (cb + ca) / 2.0;
  },

  buildPhotoId(date) {
    return `weight-tracker-photo-${moment(date).format('YYYY-MM-DD')}`
  },

  buildCircleId(date) {
    return `weight-circle-${moment(date).format('YYYY-MM-DD')}`;
  },

  buildCircleLabelId(date) {
    return `weight-circle-label-${moment(date).format('YYYY-MM-DD')}`;
  },

  buildCircleDateLabelId(date) {
    return `weight-circle-date-label-${moment(date).format('YYYY-MM-DD')}`;
  },

  photoPattern: /assets\/images\/weight-tracker\/(\d{4}-\d{2}-\d{2}).*\.jpg/,

  photos: computed(function() {
    return Object.keys(this.assetMap.map).filter((key) => {
      return this.photoPattern.test(key)
    });
  }),

  photoDates: computed('photos', function() {
    return this.photos.map((p) => {
      return moment(this.photoPattern.exec(p)[1]).toDate();
    }).sort((a,b) => a < b ? -1 : 1);
  }),

  wh: math.min(raw(300), multiply('height', raw(0.5))),

  loadPhotos() {
    const { wh, svg, photoDates } = this;

    svg.append('defs')
      .append('clipPath')
        .attr('id', 'face-clip')
        .append('circle')
          .attr('cx', wh / 2.0)
          .attr('cy', wh / 2.0)
          .attr('r', wh / 2.0);

    for (let i = 0; i < photoDates.length; i++) {
      const d = photoDates[i];
      this.loadPhoto(d);
    }
  },

  findPhotoX(date) {
    const { xScale, width, wh } = this;
    const x = xScale(date);
    if (x < width / 2.0) {
      return x + 50;
    } else {
      return x - (wh + 50);
    }
  },

  findPhotoY() {
    return (this.height - this.wh) * 0.5;
  },

  loadPhoto(date) {
    const { wh, assetMap } = this;

    const href = assetMap.resolve(`assets/images/weight-tracker/${moment(date).format('YYYY-MM-DD')}.jpg`);

    this.svg.append('image')
      .classed('hidden', true)
      .attr('width', wh)
      .attr('height', wh)
      .attr('x', 0)
      .attr('y', 0)
      .attr('clip-path', 'url(#face-clip)')
      .attr('transform', () => `translate(${this.findPhotoX(date)},${this.findPhotoY()})`)
      .attr('id', this.buildPhotoId(date))
      .attr('href', href)
      .attr('xlink:href', href);
  },

  removePhoto(date) {
    this.svg.select(`#${this.buildPhotoId(date)}`).classed('hidden', true);
    this.svg.select(`#${this.buildCircleLabelId(date)}`).classed('hidden', true);
    this.svg.select(`#${this.buildCircleDateLabelId(date)}`).classed('hidden', true);
    this.svg.selectAll('circle').attr('fill', 'red');
    this.set('selectedPhoto', null);
  },

  showPhoto(date) {
    if (this.selectedPhoto) {
      this.removePhoto(this.selectedPhoto);
    }

    this.svg
      .select(`#${this.buildCircleId(date)}`)
      .attr('fill', 'orange');

    this.svg
      .select(`#${this.buildPhotoId(date)}`)
      .classed('hidden', false);

    this.svg
      .select(`#${this.buildCircleLabelId(date)}`)
      .classed('hidden', false);

    this.svg
      .select(`#${this.buildCircleDateLabelId(date)}`)
      .classed('hidden', false);

    this.set('selectedPhoto', date);
  },

  selectedPhoto: null,

  drawPhotoMarkers() {
    const photoDates = this.photoDates;

    this.svg
      .selectAll('circle')
      .data(photoDates)
      .enter()
      .append('circle')
        .attr('id', (d) => this.buildCircleId(d))
        .attr('cx', (d) => {
          return this.xScale(d);
        })
        .attr('cy', (d) => {
          return this.yScale(this.findWeight(d));
        })
        .attr('r', 5)
        .attr('fill', 'red')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('style', 'cursor: pointer')
        .on('click', (d) => {
          if (this.playPhotosTask.isRunning) {
            this.playPhotosTask.cancelAll();
          }
          if (d === this.selectedPhoto) {
            this.removePhoto(d);
          } else {
            this.showPhoto(d);
          }
        });

    this.svg
      .selectAll('text.weight-circle-label')
      .data(photoDates)
      .enter()
      .append('text')
        .classed('weight-circle-label', true)
        .classed('hidden', true)
        .attr('id', d => this.buildCircleLabelId(d))
        .text(d => parseInt(this.findWeight(d)))
        .attr('x', d => this.findPhotoX(d) + (this.wh / 2.0))
        .attr('y', () => this.findPhotoY() - 10)
        .attr('font-weight', '100')
        .attr('font-size', textSizes['3xl'])
        .style('text-anchor', 'middle');

    this.svg
      .selectAll('text.weight-circle-date-label')
      .data(photoDates)
      .enter()
        .append('text')
          .classed('weight-circle-date-label', true)
          .classed('hidden', true)
          .attr('id', d => this.buildCircleDateLabelId(d))
          .text(d => moment(d).format('YYYY-MM-DD'))
          .attr('x', d => this.findPhotoX(d) + (this.wh / 2.0))
          .attr('y', () => this.findPhotoY() + 20 + this.wh)
          .attr('font-weight', '300')
          .attr('font-size', textSizes['base'])
          .style('text-anchor', 'middle');
  },

  drawYAxis() {
    const { yScale, padding: { left } } = this;
    this.svg
      .append('g')
      .attr('transform', `translate(${left},0)`)
      .call(axisLeft(yScale));
  },

  drawXAxis() {
    const {
      padding: { bottom },
      xScale,
      height,
    } = this;

    this.svg
      .append('g')
      .attr('transform', `translate(0,${height - bottom})`)
      .call(
        axisBottom(xScale)
          .tickFormat((d) => {
            if (d.getMonth() === 0) {
              return moment(d).format('YY');
            } else {
              return moment(d).format('MMM')[0];
            }
          })
      ).selectAll("text")
        .style("text-anchor", "middle");
  },

  drawWeightsSeries() {
    const { data, xScale, yScale } = this;

    this.svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke', 'grey')
      .datum(data)
      .attr('d', line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.weight))
      );
  },

  yScale: computed('weightAxis.{min,max}', 'height', 'padding.{top,bottom}', function() {
    const {
      weightAxis: { min, max },
      padding: { top, bottom },
      height,
    } = this;

    return scaleLinear()
      .domain([min, max])
      .range([height - bottom, top]);
  }),

  xScale: computed('dateAxis', 'width', 'padding.{left,right}', function() {
    const {
      dateAxis: { min, max },
      padding: { left, right },
      width,
    } = this;

    return scaleTime()
      .domain([min, max])
      .range([left, width - right]);
  }),
});
