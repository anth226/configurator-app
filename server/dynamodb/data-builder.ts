interface ConfigurationProduct {
  id: number;
  type: 'Product' | 'ProductVariant';
  sku?: string;
}

interface Configuration {
  id: string;
  meta: string;
  name?: string;
  done?: boolean;
  bundleProductId?: string;
  productType?: string;
  sayduckProductId?: string;
  products?: ConfigurationProduct[] | { id: string; meta: string };
  collections?: string[];
}

interface Update {
  Key: {
    id: string;
    meta: string;
  };
  UpdateExpression?: string;
  ExpressionAttributeNames: object;
  ExpressionAttributeValues: object;
}

export interface Mutation {
  Key: {
    id: string;
    meta: string;
  };
  UpdateExpression?: string;
  ExpressionAttributeNames?: object;
  ExpressionAttributeValues?: object;
}

/**
 * dataBuilder
 * Builds a data according to wanted model. If required data is missing to build the data will throw an error
 * @param {any} data - any type of data to process
 * @param {string} model - Model of which type of data to build.
 * @returns {any} data in the specified model type / interface
 */
export const dataBuilder = (
  data: Record<string, unknown>,
  model: string
): Configuration => {
  const models = {
    Configuration: (data: Configuration): Configuration => {
      if (!data.id || !data.meta || !data.name)
        throw new Error('Invalid data format.');
      const {
        id,
        meta,
        name,
        bundleProductId,
        productType,
        sayduckProductId,
        products = [],
        done,
        collections,
      } = data;
      // TODO: validate products
      const built: Configuration = {
        id,
        meta,
        name,
        bundleProductId,
        productType,
        sayduckProductId,
        products,
        collections,
        done,
      };
      return built;
    },
    ConfigurationUpdate: (data: Record<string, unknown>): Update => {
      if (!data.id || !data.meta) throw new Error('Invalid data format.');
      const { payload, id, meta } = data;

      const built = Object.keys(payload).reduce(
        (acc, curr, i, keys) => {
          if (['id', 'meta'].includes(curr)) return acc;
          return {
            ...acc,
            UpdateExpression: `${acc.UpdateExpression} #${curr} = :${curr}${
              i < keys.length - 1 ? ',' : ''
            }`,
            ExpressionAttributeNames: {
              ...acc.ExpressionAttributeNames,
              [`#${curr}`]: curr,
            },
            ExpressionAttributeValues: {
              ...acc.ExpressionAttributeValues,
              [`:${curr}`]: payload[curr],
            },
          };
        },
        {
          Key: { id, meta },
          UpdateExpression: 'set',
          ExpressionAttributeNames: {},
          ExpressionAttributeValues: {},
        } as Update
      );
      return built;
    },
    ConfigurationSection: (data: Record<string, unknown>): Mutation => {
      const { id, meta, payload } = data;
      const { id: order } = payload as { id: string };
      return {
        Key: { id, meta },
        UpdateExpression: `set #sections = list_append(if_not_exists(#sections, :empty_sections), :section),
          #order = list_append(if_not_exists(#order, :empty_order), :order)`,
        ExpressionAttributeNames: {
          '#sections': 'sections',
          '#order': 'sectionOrder',
        },
        ExpressionAttributeValues: {
          ':section': [payload],
          ':empty_sections': [],
          ':order': [order],
          ':empty_order': [],
        },
      } as Mutation;
    },
    ConfigurationSectionUpdate: (data: Record<string, unknown>): Mutation => {
      const { id, meta, index, payload } = data;
      const built = Object.keys(payload).reduce(
        (acc, curr, i, keys) => {
          return {
            ...acc,
            UpdateExpression: `${
              acc.UpdateExpression
            } #sections[${index}].#${curr} = :${curr}${
              i < keys.length - 1 ? ',' : ''
            }`,
            ExpressionAttributeValues: {
              ...acc.ExpressionAttributeValues,
              [`:${curr}`]: payload[curr],
            },
            ExpressionAttributeNames: {
              ...acc.ExpressionAttributeNames,
              [`#${curr}`]: curr,
            },
          };
        },
        {
          Key: { id, meta },
          UpdateExpression: 'set',
          ExpressionAttributeNames: { '#sections': 'sections' },
          ExpressionAttributeValues: {},
        } as Mutation
      );
      return built;
    },
    ConfigurationSectionDelete: (data: Record<string, unknown>): Mutation => {
      const { id, meta, index, orderIndex } = data;

      return {
        Key: { id, meta },
        UpdateExpression: `remove #sections[${index}], #order[${orderIndex}]`,
        ExpressionAttributeNames: {
          '#sections': 'sections',
          '#order': 'sectionOrder',
        },
      } as Mutation;
    },
    ConfigurationProducts: (data: Configuration): Configuration => {
      const { products, id, meta } = data;
      const built: Configuration = {
        id,
        meta,
        products: products as ConfigurationProduct[],
      };
      return built;
    },
    SectionOption: (data: Record<string, unknown | any>): Mutation => {
      const { id, meta, payload, index } = data;
      return {
        Key: { id, meta },
        UpdateExpression: `set #sections[${index}].#options = list_append(if_not_exists(#sections[${index}].#options, :empty_options), :option),
        #sections[${index}].#order = list_append(if_not_exists(#sections[${index}].#order, :empty_order), :order)`,
        ExpressionAttributeNames: {
          '#sections': 'sections',
          '#options': 'options',
          '#order': 'optionOrder',
        },
        ExpressionAttributeValues: {
          ':option': [payload],
          ':empty_options': [],
          ':order': [payload.id],
          ':empty_order': [],
        },
      } as Mutation;
    },
    SectionOptionUpdate: (data: Record<string, unknown>): Mutation => {
      const { id, meta, payload, index, optionIndex } = data;
      const built = Object.keys(payload).reduce(
        (acc, curr, i, keys) => {
          return {
            ...acc,
            UpdateExpression: `${
              acc.UpdateExpression
            } #sections[${index}].#options[${optionIndex}].#${curr} = :${curr}${
              i < keys.length - 1 ? ',' : ''
            }`,
            ExpressionAttributeValues: {
              ...acc.ExpressionAttributeValues,
              [`:${curr}`]: payload[curr],
            },
            ExpressionAttributeNames: {
              ...acc.ExpressionAttributeNames,
              [`#${curr}`]: curr,
            },
          };
        },
        {
          Key: { id, meta },
          UpdateExpression: 'set',
          ExpressionAttributeNames: {
            '#sections': 'sections',
            '#options': 'options',
          },
          ExpressionAttributeValues: {},
        } as Mutation
      );
      return built;
    },
    SectionOptionDelete: (data: Record<string, unknown>): Mutation => {
      const { id, meta, index, optionIndex, optionOrderIndex } = data;

      return {
        Key: { id, meta },
        UpdateExpression: `remove #sections[${index}].#options[${optionIndex}], #sections[${index}].#order[${optionOrderIndex}]`,
        ExpressionAttributeNames: {
          '#sections': 'sections',
          '#options': 'options',
          '#order': 'optionOrder',
        },
      } as Mutation;
    },
  };
  return models[model](data);
};
