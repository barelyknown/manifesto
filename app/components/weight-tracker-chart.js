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
import { get } from '@ember/object';

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
    const url = this.assetMap.resolve('assets/data/weight-measurements.csv');
    const data = (yield csv(url)).map((d) => {
      return {
        date: moment(d.date, 'M/D/YYYY').toDate(),
        weight: parseFloat(d.weight),
      };
    });
    this.set('data', data);
  }),

  padding: computed(function() {
    return {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    };
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
    const { xScale, height, innerWidth, padding: { left, bottom } } = this;
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
    const { height, padding: { top, bottom } } = this;

    return scaleLinear()
      .domain([145, 195])
      .range([height - bottom, top]);
  }),

  xScale: computed('data', 'width', 'padding.{left,right}', function() {
    const { data, width, padding: { left, right } } = this;

    const dates = data.map(w => w.date);

    return scaleTime()
      .domain([Math.min(...dates),Math.max(...dates)])
      .range([left, width - right])
  }),
});
