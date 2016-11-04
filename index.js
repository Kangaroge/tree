const redent = require('strip-indent')
const map = require('object-loops/map')
const values = require('object-loops/values')

const COLORS = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#f1c40f',
  '#e67e22',
  '#e74c3c'
]

const SYMBOLS = {
  male: '♂',
  female: '♀',
  deceased: '†'
}

function render (data) {
  var output = []

  const people = normalizePeople(data.people || [], data.options || {})
  const families = data.families || []

  return redent(`
    digraph G {
      # Header
      edge [dir=none, color="#cccccc"];
      node [shape=box, fontname="sans-serif", width=2.5, color="#cccccc"];
      rankdir=LR;
      ranksep=0.4;
      splines=ortho;

      # People
      ${values(map(people, renderPerson)).join('\n')}
      ${values(map(families, renderFamily)).join('')}
    }
  `)
}

function renderPerson (person, id) {
  const label =
    '<table align="center" border="0" cellpadding="0" cellspacing="2" width="4">' +
    '<tr><td align="center">' +
    `${person.name}</td></tr>` +
    '<tr><td align="center">' +
    '<font point-size="10" color="#aaaaaa">' +
    `${person.fullname || person.name}</font></td></tr></table>`

  return `"${id}" [label=<${label}>];`
}

function renderFamily (family, id) {
  const color = COLORS[id % COLORS.length]
  const parents = family.parents || []
  const offsprings = family.offsprings || []
  return redent(`
    ${parents.length > 0 ? `
      # Family ${id}
      m${id} [shape=diamond, label="", height=0.1, width=0.1, style=filled, color="${color}"];
      {rank=same; "${parents.join('", "')}"};
      ${parents.map(parent => {
        return `"${parent}":e -> m${id} [color="${color}"];`
      }).join('\n')}
    ` : ''}

    ${offsprings.length > 0 ? `
      k${id} [shape=circle, label="", height=0.01, width=0.01];
      {rank=same; "${offsprings.join('", "')}"};
      m${id} -> k${id} [color="${color}", weight=10];
      ${offsprings.map(kid => {
        return `k${id} -> "${kid}":w [color="${color}", dir=forward, arrowhead=tee, arrowsize=2, weight=2];`
      }).join('\n')}
    ` : ''}

    ${offsprings.length > 1 ? `
      {"${offsprings.join('" -> "')}" [style=invis, weight=5]};
    ` : ''}
  `)
}

/**
 * Normalizes people options.
 */

function normalizePeople (people, options) {
  return map(people, p => normalizePerson(p, options))
}

/**
 * Normalizes person names and such.
 */

function normalizePerson (person, options) {
  return person
}

/*
 * Export
 */

module.exports = render
