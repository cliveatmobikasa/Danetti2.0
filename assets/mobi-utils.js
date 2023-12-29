// target_properties
const defineTargetEls = (constructor, module) => {
  const prototype = constructor.prototype
  const targetNames = getTargetNamesForConstructor(constructor)

  targetNames.forEach(name =>
    defineLinkedProperties(module, {
      [`${name}El`]: {
        get () {
          const target = module.targets.find(name)

          if (target) {
            return target
          }

          console.info(`Missing target element "${module.identifier}.${name}`)
        },
      },
      [`${name}Els`]: {
        get () {
          return module.targets.findAll(name)
        },
      },
      [`has${capitalize(name)}El`]: {
        get () {
          return module.targets.has(name)
        },
      },
    }),
  )
  buildSelectors(prototype, targetNames)
}

const getTargetNamesForConstructor = (constructor) => {
  const ancestors = getAncestorsForConstructor(constructor)

  return Array.from(
    ancestors.reduce((targetNames, constructor) => {
      getOwnTargetNamesForConstructor(constructor).forEach(name => targetNames.add(name))
      return targetNames
    }, new Set()),
  )
}

const getAncestorsForConstructor = (constructor) => {
  const ancestors = []

  while (constructor) {
    ancestors.push(constructor)
    constructor = Object.getPrototypeOf(constructor)
  }

  return ancestors
}

const getOwnTargetNamesForConstructor = (constructor) => {
  const definition = constructor['targets']

  return Array.isArray(definition) ? definition : []
}

const defineLinkedProperties = (object, properties) => {
  Object.keys(properties).forEach(name => {
    if (!(name in object)) {
      const descriptor = properties[name]

      Object.defineProperty(object, name, descriptor)
    }
  })
}

const capitalize = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const buildSelectors = (object, targets) => {
  if (!('selectors' in object)) {
    Object.defineProperty(object, 'selectors', {
      get () {
        return targets.reduce((selectors, target) => {
          selectors[target] = `[${this.context.schema.elAttribute}="${
            this.context.identifier
          }.${target}"]`
          return selectors
        }, {})
      },
    })
  }
}
// instance_method
const bindInstanceMethods = (constructor, module) => {
  const instanceMethodNames = getMethodNamesForConstructor(constructor);

  instanceMethodNames.forEach(name => {
    module[name] = module[name].bind(module);
  })
}

const getMethodNamesForConstructor = (constructor) => {
  const ancestors = getAncestorsForConstructor(constructor);

  return Array.from(
    ancestors.reduce((targetNames, constructor) => {
      getOwnTargetNamesForConstructor(constructor).forEach(name => targetNames.add(name));

      return targetNames
    }, new Set()),
  )
}
// bless_state
const blessState = (constructor, module) => {
  const initialStateProperties = getInitialStatePropertiesForConstructor(constructor)

  initialStateProperties.forEach(property => addInitialState(module, property))
}

const getInitialStatePropertiesForConstructor = (constructor) => {
  const ancestors = getAncestorsForConstructor(constructor)

  return Array.from(
    ancestors.reduce((initialStateProperties, constructor) => {
      getOwnInitialStatePropertiesForConstructor(constructor).forEach(property =>
        initialStateProperties.add(property),
      )
      return initialStateProperties
    }, new Set()),
  )
}

const getOwnInitialStatePropertiesForConstructor = (constructor) => {
  const definition = constructor['initialState']

  return Array.isArray(definition) ? definition : []
}

const addInitialState = (module, property) => {
  if (!module.data.has(property.name)) {
    console.info(
      `Can't find ${module.data._getFormattedKey(property.name)} on ${
        module.identifier
      }'s element so can't set the initial state for it`,
    )
  }

  if (property.type === Number) {
    module.state.addKey(property.name, parseInt(module.data.get(property.name), 10))
  } else if (property.type === Boolean) {
    module.state.addKey(property.name, module.data.get(property.name) === 'true')
  } else {
    module.state.addKey(property.name, module.data.get(property.name))
  }
}

const attributeValueContainsToken = (attributeName, token) => {
  return `[${attributeName}~="${token}"]`
}

const dasherize = (value) => {
  return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`)
}

const domReady = () => {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve)
    } else {
      resolve()
    }
  })
}

const getElement = (selector, { context = document } = {}) => context.querySelector(selector);

const getElements = (selector, { context = document} = {}) => {
  const items = context.querySelectorAll(selector);
  return Array.from(items);
}

const handlize = name => name.split('-').map(subName => capitalize(subName)).join('');

const uncapitalize = name => name.charAt(0).toLowerCase() + name.slice(1);

const createObject = (className, el, application) => {
  const Class = window.MOBIKASA.modules[className];
  if (Class && typeof(Class?.build) === 'function') {
    return Class.build(el, application);
  } else if(typeof(Class) === 'function') {
    return new Class(el, application);
  } else {
    return null;
  }
};

const getOffsetTop = (el, parent = document.body, offsetTop = 0) => {
  if (!isNaN(el.offsetTop)) {
    offsetTop += el.offsetTop;
  }
  return el.offsetParent === parent ? offsetTop : getOffsetTop(el.offsetParent, parent, offsetTop);
}

class SectionRendering {
  /**
   * Request a section, or sections, from the section rendering API
   *
   * @param {string|string[]} sections - The names of the sections we want to fetch
   * @param {string} [sectionsUrl] - The context in which we want the sections to be
   *   rendered in
   *
   * @returns {Promise<Object>}
   */
  async fetch (sections, sectionsUrl = this.sectionsUrl) {
    if (typeof sections === 'string') {
      sections = [sections]
    }

    const [path, querystring = ''] = sectionsUrl.split('?')

    // eslint-disable-next-line compat/compat
    const params = new URLSearchParams(querystring)
    params.append('sections', sections.join(','))

    const section = await fetch(`${path}?${params.toString()}`)

    return section.json()
  }

  /**
   * Request a single section from the section rendering API
   * https://shopify.dev/api/section-rendering#request-a-single-section
   *
   * @param {string} section - The names of the section we want to fetch
   * @param {string} [sectionsUrl] - The context in which we want the sections to be
   *   rendered in
   *
   * @returns {Promise<string>}
   */
  async fetchSingle (section, sectionsUrl = window.location.pathname) {
    const [path, querystring = ''] = sectionsUrl.split('?')

    // eslint-disable-next-line compat/compat
    const params = new URLSearchParams(querystring)
    params.set('section_id', section)

    const response = await fetch(`${path}?${params.toString()}`)

    return response.text()
  }

  /**
   * Render a section returned from the section rendering API
   *
   * @param {Section} section - The makeup of the section we want to render
   *
   * @returns {void}
   */
  render (section) {
    if ('dontRender' in section && section.dontRender) return

    this.validate(section)

    const elementToReplace =
      document.getElementById(section.id).querySelector(section.selector) ||
      document.getElementById(section.id)

    const newHTML = this.getInnerHtml(section.html, section.selector)
    const oldHTML = elementToReplace.innerHTML

    elementToReplace.innerHTML =
      typeof section.convertor === 'function' ? section.convertor(oldHTML, newHTML) : newHTML
  }

  /**
   * Render multiple sections returned from the section rendering API
   *
   * @param {Section[]} sections - The sections we want to render
   *
   * @returns {void}
   */
  renderMultiple (sections) {
    sections.forEach(section => this.render(section))
  }

  /**
   * Grab the HTML that is inside the section otherwise we end up with section inception
   *
   * @param {string} html - The section HTML returned from the section rendering API
   * @param {string} selector - The CSS selector which contains the sections content
   *
   * @returns {string}
   */
  getInnerHtml (html, selector = '.shopify-section') {
    return this.convertToDOM(html).querySelector(selector).innerHTML
  }

  /**
   * Convert a HTML string into a parseable DOM
   *
   * @param {string} html
   *
   * @returns {Document}
   */
  convertToDOM (html) {
    return new DOMParser().parseFromString(html, 'text/html')
  }

  /**
   * Render a section returned from the section rendering API
   *
   * @param {Section} section - The makeup of the section we want to render
   *
   * @returns {boolean}
   */
  validate (section) {
    const isValid = this.expectedKeys.every(key => key in section)

    if (!isValid) {
      throw new Error(
        `section is missing these keys: "${this.expectedKeys
          .filter(k => !(k in section))
          .join(', ')}"`,
      )
    }

    return isValid
  }

  get expectedKeys () {
    return ['id', 'selector', 'html']
  }

  /**
   * @returns {Section[]}
   */
  get pushCartSections () {
    return [
      {
        id: 'push-cart-items',
        section: 'push-cart-items',
        selector: '.shopify-section',
      },
      {
        id: 'push-cart-footer',
        section: 'push-cart-footer',
        selector: '.shopify-section',
      },
      {
        id: 'push-cart-count',
        section: 'push-cart-count',
        selector: '.shopify-section',
        dontRender: true,
      },
    ]
  }

  /**
   * @returns {Section[]}
   */
  get cartSections () {
    return [
      {
        id: 'push-cart-count',
        section: 'push-cart-count',
        selector: '.shopify-section',
        dontRender: true,
      },
      {
        id: 'template-cart-items',
        section: document.getElementById('template-cart-items').dataset.id,
        selector: '.js-Contents',
      },
      {
        id: 'template-cart-footer',
        section: document.getElementById('template-cart-footer').dataset.id,
        selector: '.js-Contents',
      },
    ]
  }

  /**
   * @returns {string} The current url pathname and query parameters
   */
  get sectionsUrl () {
    return `${window.location.pathname}${window.location.search}`
  }
}
const SectionRenderer = new SectionRendering();
