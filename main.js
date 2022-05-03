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
  '*': (settings = {}) => makeElement('sas-prod', settings),
  '#': (settings = {}) => makeElement('sas-value', settings),
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
      if (terms.length > 1) {
        this.appendChild(document.createTextNode('('))
      }
      for(let i in terms) {
        let term = terms[i]
        if (i > 0) {
          if (term < 0) {
            term = -term
            this.appendChild(document.createTextNode(' - '))
          } else {
            this.appendChild(document.createTextNode(' + '))
          }
        }
        let element
        if (Array.isArray(term)) {
          const type = term[0]
          element = algebra[type]()
          element.terms = term.slice(1)
        } else {
          element = algebra['#']()
          element.term = term
        }
        this.appendChild(element)
      }
      if (terms.length > 1) {
        this.appendChild(document.createTextNode(')'))
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
      if (terms.length > 1) {
        this.appendChild(document.createTextNode('('))
      }
      for(let i in terms) {
        const term = terms[i]
        if (i > 0 && !isNaN(term)) {
          this.appendChild(document.createTextNode(' × '))
        }
        let element
        if (Array.isArray(term)) {
          const type = term[0]
          element = algebra[type]()
          element.terms = term.slice(1)
        } else {
          element = algebra['#']()
          element.term = term
        }
        this.appendChild(element)
      }
      if (terms.length > 1) {
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
      console.log(this.term)
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
      let element
      if (Array.isArray(this.value)) {
        const [type, ...terms] = this.value
        element = algebra[type]()
        element.terms = terms
      } else {
        element = algebra['#']()
        element.term = this.value
      }
      this.appendChild(element)
    }
  }
})