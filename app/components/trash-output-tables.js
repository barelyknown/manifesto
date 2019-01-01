import Component from '@ember/component';
import { task } from 'ember-concurrency';
import fetch from 'fetch';
import Papa from 'papaparse';
import { inject as service } from '@ember/service';
import { computed, array, raw } from 'ember-awesome-macros';
import { KINDS } from 'manifesto/models/trash-output';

export default Component.extend({
  tagName: '',

  didInsertElement() {
    this.loadDataTask.perform();
  },

  borderColor: 'grey-light',

  cellPadding: 1,

  store: service(),

  totalLbs: array.reduce(
    array.mapBy('trashOutput', raw('lbs')),
    (total, lbs) => {
      return total + lbs;
    }, 0
  ),

  lbsByKind: computed('trashOutput', (trashOutput) => {
    if (typeof trashOutput === "undefined") return;

    const groups = [];
    for (let k = 0; k < KINDS.length; k++) {
      groups.push({
        kind: KINDS[k],
        lbs: 0,
      });
    }
    for (let t = 0; t < trashOutput.length; t++) {
      const group = groups.find((g) => {
        return g.kind === trashOutput[t].kind;
      });
      group.lbs += trashOutput[t].lbs;
    }
    return groups.sort((a,b) => {
      return a.lbs > b.lbs ? -1 : 1;
    });
  }),

  loadDataTask: task(function * () {
    const { store } = this;
    store.unloadAll('trash-output');
    const response = yield fetch('/assets/data/trash-output.csv');
    if (response.status !== 200) return;

    const csv = yield response.text();
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    for (let d = 0; d < parsed.data.length; d++) {
      const datum = parsed.data[d];
      const doc = {
        id: d + 1,
        type: 'trash-output',
        attributes: {
          date: datum.date,
          lbs: Number(datum.lbs),
          kind: datum.kind,
        }
      };
      store.push({ data: doc });
    }
    this.set(
      'trashOutput',
      store.peekAll('trash-output').toArray().sort((a, b) => {
        return a.date < b.date ? -1 : 1;
      })
    );
  })
});
