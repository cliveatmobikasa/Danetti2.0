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