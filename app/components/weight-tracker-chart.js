import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, waitForProperty } from 'ember-concurrency';
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

  dates: array.sort(array.mapBy('data', raw('date')), (a,b) => a < b),

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
    right: 50,
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
      .attr('transform', `translate(${left + innerWidth / 2},${top})`)
      .attr('text-anchor', 'middle')
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

  drawPhotoMarkers() {
    const pattern = /assets\/images\/weight-tracker\/(\d{4}-\d{2}-\d{2})\.jpg/;
    const photos = Object.keys(this.assetMap.map).filter((key) => {
      return pattern.test(key)
    });
    const photoDates = photos.map((p) => {
      return moment(pattern.exec(p)[1]).toDate();
    });

    this.svg
      .selectAll('marker')
      .data(photoDates)
      .enter()
      .append('circle')
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
        .on('mouseover', (d, i) => {
          const wh = Math.min(300, this.height * 0.8, this.width * 0.5);
          this.svg.append('image')
            .attr('width', wh)
            .attr('height', wh)
            .attr('x', () => {
              const x = this.xScale(d);
              if (x < this.width / 2.0) {
                return x + 10;
              } else {
                return x - wh - 10;
              }
            })
            .attr('y', () => {
              return (this.height - wh) * 0.5;
            })
            .attr('id', this.buildPhotoId(d))
            .attr('href', this.assetMap.resolve(photos[i]))
        })
        .on('mouseout', (d) => {
          this.svg
            .select(`image#${this.buildPhotoId(d)}`)
            .remove();
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
