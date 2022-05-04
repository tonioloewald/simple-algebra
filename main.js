import b8r from './node_modules/@tonioloewald/b8r/source/b8r.js'

// convenience for debugging
window.b8r = b8r

const expression = ['+', ['*', 2, ['+', 'x', 1]], ['*', 5, 'y'], 'z']

b8r.reg.app = {
  expression, 
  expressionJSON: JSON.stringify(expression),
  error: false,
  update(){
    try {
      const expression = JSON.parse(b8r.reg.app.expressionJSON)
      if (expression) {
        b8r.reg.app.expression = expression
      }
      b8r.reg.app.error = false
    } catch(error) {
      b8r.reg.app.error = error
    }
  }
}

const {makeWebComponent, makeElement} = b8r.webComponents

const algebra = {
  '+': (settings = {}) => makeElement('sas-sum', settings),
  '-': (settings = {}) => makeElement('sas-negative', settings),
  '*': (settings = {}) => makeElement('sas-prod', settings),
  '#': (settings = {}) => makeElement('sas-value', settings),
  '=': (settings = {}) => makeElement('sas-eq', settings),
  '^': (settings = {}) => makeElement('sas-pow', settings),
  '/': (settings = {}) => makeElement('sas-frac', settings),
  '√': (settings = {}) => makeElement('sas-root', settings),
}

function renderError(message) {
  const element = b8r.create('span')
  element.textContent = message
  element.style.color = 'red'
  return element
}

function renderTerm(term) {
  let element
  if (Array.isArray(term)) {
    const type = term[0]
    if (algebra[type]) {
      element = algebra[type]()
      element.terms = term.slice(1)
    } else {
      element = renderError('unrecognized type')
    }
  } else {
    element = algebra['#']()
    element.term = term
  }
  return element
}

function topLevel(element) {
  return element.parentElement.matches('sas-expression, sas-eq, sas-frac')
}

function isNegative(term) {
  return typeof term === 'number' || (Array.isArray(term) && term[0] === '-')
}

makeWebComponent('sas-sum', {
  attributes: {
    terms: [1, 1]
  },
  content: false,
  methods: {
    render () {
      const {terms} = this
      this.textContent = ''
      if (terms.length > 1 && !topLevel(this)) {
        this.appendChild(document.createTextNode('('))
      }
      for(let i in terms) {
        let term = terms[i]
        if (i > 0) {
          if (isNegative(term)) {
            term = Array.isArray(term) ? term[1] : -term
            this.appendChild(document.createTextNode(' - '))
          } else {
            this.appendChild(document.createTextNode(' + '))
          }
        }
        this.appendChild(renderTerm(term))
      }
      if (terms.length > 1 && !topLevel(this)) {
        this.appendChild(document.createTextNode(')'))
      }
    }
  }
})

makeWebComponent('sas-frac', {
  attributes: {
    terms: [1, 2]
  },
  content: false,
  methods: {
    render () {
      this.textContent = ''
      if (this.terms.length === 2) {
        const [x, y] = this.terms
        this.appendChild(renderTerm(x))
        this.appendChild(renderTerm(y))
      } else {
        this.appendChild(renderError('fraction exactly two terms'))
      }
    }
  }
})

makeWebComponent('sas-pow', {
  attributes: {
    terms: ['x', 2]
  },
  content: false,
  methods: {
    render () {
      this.textContent = ''
      if (this.terms.length === 2) {
        const [x, y] = this.terms
        this.appendChild(renderTerm(x))
        const exponent = renderTerm(y)
        exponent.classList.add('exponent')
        this.appendChild(exponent)
      } else {
        this.appendChild(renderError('power requires exactly two terms'))
      }
    }
  }
})

makeWebComponent('sas-negative', {
  attributes: {
    terms: [17]
  },
  content: false,
  methods: {
    render() {
      this.textContent = ''
      if (this.terms.length === 1) {
        this.appendChild(document.createTextNode('-'))
        this.appendChild(renderTerm(this.terms[0]))
      } else {
        this.appendChild(renderError('negative requires exactly one term'))
      }
    }
  }
})

makeWebComponent('sas-root', {
  attributes: {
    terms: ['x', 2]
  },
  content: false,
  methods: {
    render () {
      this.textContent = ''
      if (this.terms.length === 2) {
        const [x, y] = this.terms
        if (y !== 2) {
          const root = renderTerm(y)
          root.classList.add('root')
          this.appendChild(root)
        }
        this.appendChild(document.createTextNode('√'))
        this.appendChild(renderTerm(x))
      } else {
        this.appendChild(renderError('root requires exactly two terms'))
      }
    }
  }
})

makeWebComponent('sas-eq', {
  attributes: {
    terms: ['x','x']
  },
  content: false,
  methods: {
    render () {
      const {terms} = this
      this.textContent = ''
      for(let i in terms) {
        let term = terms[i]
        if (i > 0) {
          this.appendChild(document.createTextNode(' = '))
        }
        this.appendChild(renderTerm(term))
      }
    }
  }
})

makeWebComponent('sas-prod', {
  attributes: {
    terms: [1, 1]
  },
  content: false,
  methods: {
    render () {
      const {terms} = this
      this.textContent = ''
      const needsParentheses = !topLevel(this) && !this.parentElement.matches('sas-sum, sas-negative')
      if (needsParentheses) {
        this.appendChild(document.createTextNode('('))
      }
      for(let i in terms) {
        const term = terms[i]
        if (i > 0 && !isNaN(term)) {
          this.appendChild(document.createTextNode(' × '))
        }
        this.appendChild(renderTerm(term))
      }
      if (needsParentheses) {
        this.appendChild(document.createTextNode(')'))
      }
    }
  }
})

makeWebComponent('sas-value', {
  attributes: {
    term: 'x'
  },
  content: false,
  methods: {
    render () {
      this.textContent = ''
      if (!isNaN(Number(this.term))) {
        const span = b8r.create('span')
        span.textContent = this.term
        this.appendChild(span)
      } else {
        const italic = b8r.create('i')
        italic.textContent = this.term
        this.appendChild(italic)
      }
    }
  }
})

makeWebComponent('sas-expression', {
  attributes: {
    value: ['+', ['*', 2, ['+', 'x', 1]], ['*', 5, 'y'], 'z']
  },
  content: false,
  methods: {
    render () {
      this.textContent = ''
      this.appendChild(renderTerm(this.value))
    }
  }
})