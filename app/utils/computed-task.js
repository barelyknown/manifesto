import {
  defineProperty
} from '@ember/object';

import {
  task
} from 'ember-concurrency';

import ComputedProperty from '@ember/object/computed';
import { expandProperties } from '@ember/object/computed';

function parseArgs(args) {
  return {
    dependentKeys: args.slice(0, -1),
    generatorFunction: args[args.length - 1],
  };
}

class ComputedTaskProperty extends ComputedProperty {
  constructor(...args) {
    const { dependentKeys, generatorFunction } = parseArgs(args);
    super(function(propertyName) {
      const taskName = `${propertyName}Task`;
      const isInitializedKeyName = `isComputedTaskInitialized-${propertyName}`;
      const isInitialized = this.get(isInitializedKeyName);
      const valueKeyName = `${taskName}.lastSuccessful.value`;
      if (!isInitialized) {
        defineProperty(this, taskName, task(generatorFunction).restartable());
        this.addObserver(valueKeyName, () => {
          this.notifyPropertyChange(propertyName);
        });
        this.get(taskName).perform();
        const expandedKeys = [];
        dependentKeys.forEach((dependentKey) => {
          expandProperties(dependentKey, (property) => {
            expandedKeys.push(property);
          });
        });
        expandedKeys.forEach((expandedKey) => {
          this.addObserver(expandedKey, () => {
            this.get(taskName).perform();
          });
        });
        this.set(isInitializedKeyName, true);
      }

      return this.get(valueKeyName);
    });
  }
}

export default function computedTask(...args) {
  return new ComputedTaskProperty(...args);
}
