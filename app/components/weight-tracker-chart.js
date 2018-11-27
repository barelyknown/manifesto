import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, waitForProperty, timeout } from 'ember-concurrency';
import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import $ from 'jquery';
import moment from 'moment';
import { array, raw, subtract, add, hash } from 'ember-awesome-macros';

export default Component.extend({
  tagName: 'svg',

  classNames: [
    'w-full',
    'h-screen-1/2',
  ],

  init() {
    this._super(...arguments);
    this.loadDataTask.perform();
    this.resizeService.on('debouncedDidResize', () => {
      this.drawChartTask.perform();
    });
  },

  didInsertElement() {
    this.drawChartTask.perform();
  },

  assetMap: service(),

  loadDataTask: task(function * () {
    const url = 'assets/data/weight-measurements.csv';
    const data = (yield csv(url)).map((d) => {
      return {
        date: moment(d.date, 'M/D/YYYY').toDate(),
        weight: parseFloat(d.weight),
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
    top: 50,
    right: 0,
    bottom: 50,
    left: 50,
  }),

  innerWidth: computed('width', 'padding.{left,right}', function() {
    const { width, padding: { left, right } } = this;
    return width - left - right;
  }),

  drawChartTask: task(function * () {
    yield waitForProperty(this, 'data', v => isPresent(v));
    this.set('svg', select(this.element));
    this.resetChart();
    this.drawTitle();
    this.drawYAxis();
    this.drawXAxis();
    this.drawWeightsSeries();
    this.drawPhotoMarkers();
    this.playPhotosTask.linked().perform();
  }),

  playPhotosTask: task(function * () {
    yield timeout(5000);
    for (let i = 0; i < this.photoDates.length; i++) {
      const date = this.photoDates[i];
      this.showPhoto(date);
      yield timeout(1000);
    }
    this.removePhoto(this.selectedPhoto);
  }),

  resetChart() {
    this.svg.selectAll("*").remove();
    this.setProperties({
      height: $(this.element).height(),
      width: $(this.element).width(),
    });
  },

  drawTitle() {
    const { innerWidth, padding: { left, top } } = this;
    this.svg
      .append('text')
      .text('Weight by Date')
      .attr('dy', '-0.25em')
      .attr('transform', `translate(${left},${top})`)
      .attr('text-anchor', 'left')
      .attr('font-size', '1.25rem')
      .attr('font-weight', 'bold')
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

  photoPattern: /assets\/images\/weight-tracker\/(\d{4}-\d{2}-\d{2}).*\.jpg/,

  photos: computed(function() {
    return Object.keys(this.assetMap.map).filter((key) => {
      return this.photoPattern.test(key)
    });
  }),

  photoDates: computed('photos', function() {
    return this.photos.map((p) => {
      return moment(this.photoPattern.exec(p)[1]).toDate();
    })
  }),

  removePhoto(id) {
    this.svg.select(`#${id}`).remove();
    this.svg.selectAll('circle').attr('fill', 'red');
    this.set('selectedPhoto', null);
  },

  showPhoto(date) {
    if (this.selectedPhoto) {
      this.removePhoto(this.selectedPhoto);
    }

    const wh = Math.min(300, this.height * 0.8, this.width * 0.5);

    const href = this.assetMap.resolve(`assets/images/weight-tracker/${moment(date).format('YYYY-MM-DD')}.jpg`);

    this.svg
      .select(`#${this.buildCircleId(date)}`)
      .attr('fill', 'orange');

    this.svg.append('image')
      .attr('width', wh)
      .attr('height', wh)
      .attr('x', () => {
        const x = this.xScale(date);
        if (x < this.width / 2.0) {
          return x + 50;
        } else {
          return x - wh - 50;
        }
      })
      .attr('y', () => {
        return (this.height - wh) * 0.5;
      })
      .attr('id', this.buildPhotoId(date))
      .attr('href', href)
      .attr('xlink:href', href)

    this.set('selectedPhoto', this.buildPhotoId(date));
  },

  selectedPhoto: null,

  drawPhotoMarkers() {
    const photos = this.photos;
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
          const id = this.buildPhotoId(d);
          if (id === this.selectedPhoto) {
            this.removePhoto(id);
          } else {
            this.showPhoto(d);
          }
        })
  },

  drawYAxis() {
    const { yScale, height, padding: { left, bottom } } = this;
    this.svg
      .append('g')
      .attr('transform', `translate(${left},0)`)
      .call(axisLeft(yScale));

    this.svg
      .append('text')
      .text('First Morning Weight (lbs)')
      .attr('alignment-baseline', 'hanging')
      .attr('transform', ()=> {
        return [
          `translate(0,${height - bottom})`,
          'rotate(-90)'
        ].join(' ');
      });
  },

  drawXAxis() {
    const {
      padding: { left, bottom },
      xScale,
      height,
      innerWidth,
    } = this;

    this.svg
      .append('g')
      .attr('transform', `translate(0,${height - bottom})`)
      .call(axisBottom(xScale))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "0.5em")
        .attr("transform", () => "rotate(-45)");

    this.svg
      .append('text')
      .attr('x', left + innerWidth / 2)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1rem')
      .text('Date')
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

  yScale: computed('height', 'padding.{top,bottom}', function() {
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
