import {
  defineProperty
} from '@ember/object';

import {
  task
} from 'ember-concurrency';

import ComputedProperty from '@ember/object/computed';

import {
  expandProperties
} from '@ember/object/computed';

const _CP = ComputedProperty;

function parseArgs(args) {
  return {
    dks: args.slice(0, -1),
    gf: args[args.length - 1],
  };
}

const ComputedTaskProperty = function (...args) {
  const { dks, gf } = parseArgs(args);

  return _CP.call(this, function(pn) {
    const tn = `${pn}Task`;

    const isInitKn = [
      'isCtInit',
      pn
    ].join('-');

    const isInit = this.get(isInitKn);

    const vkn = [
      tn,
      'lastSuccessful',
      'value'
    ].join('.');

    if (!isInit) {
      defineProperty(
        this,
        tn,
        task(gf).restartable()
      );

      this.addObserver(vkn, () => {
        this.notifyPropertyChange(pn);
      });

      this.get(tn).perform();

      const eks = [];

      dks.forEach((dk) => {
        expandProperties(dk, (p) => {
          eks.push(p);
        });
      });

      eks.forEach((ek) => {
        this.addObserver(ek, () => {
          this.get(tn).perform();
        });
      });

      this.set(isInitKn, true);
    }

    return this.get(vkn);
  });
}

ComputedTaskProperty.prototype = Object.create(
  ComputedProperty.prototype
);

export default function computedTask(...args) {
  return new ComputedTaskProperty(...args);
}
