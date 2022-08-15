import { useCallback, useEffect, useState } from 'react';
import { useAuthToken } from '../context/AuthContext';
import { QueryParams } from '../hooks/useQueryParams';
import {
  IPagedProducts,
  IConfiguration,
  IConfigurationPayload,
  ISectionPayload,
  IOptionPayload,
  IImagePayload,
  IPagedCollections,
  IProducTypeResult,
} from './interfaces';
import { Configuration } from '../interfaces/Configuration';

export const authenticate = async (payload: QueryParams) => {
  const url = `${process.env.REACT_APP_API_HOST}auth`;
  const res = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.info(data);

  if (data.authUrl) window.location.href = data.authUrl;
  return data.token ? data : data.error || data.message ? data : 'Unauthorized';
};

export const install = async (payload: QueryParams) => {
  const url = `${process.env.REACT_APP_API_HOST}install`;
  const res = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 200)
    window.location.href = `https://${payload.shop}/admin/apps`;
};

// Get a list of all products
//
// GET HOST/dev/products
export const useProducts = (limit: number = 0) => {
  const [products, setProducts] = useState<IPagedProducts>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthToken();

  const fetchProducts = useCallback(
    async (limit: number = 0, path?: string) => {
      try {
        setLoading(true);
        const url = path
          ? `${path}`
          : limit > 0
          ? `${process.env.REACT_APP_API_HOST}products?limit=${limit}`
          : `${process.env.REACT_APP_API_HOST}products`;
        fetch(url, {
          headers: {
            Authorization: token || '',
          },
        })
          .then((response) => response.json())
          .then(
            (data) => {
              console.info('products:', data);
              setProducts(data.products);
            },
            (reason) => {
              console.error(reason);
              setError(reason);
            }
          );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    if (!products && !loading && token) {
      fetchProducts(limit);
    }
  }, [loading, token, fetchProducts, limit, products]);

  return { products, fetchProducts, loading, error };
};

// Get a list of product types
//
// GET HOST/dev/products/types
export const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState<IProducTypeResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthToken();

  const getProductTypes = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${process.env.REACT_APP_API_HOST}products/types`;
      fetch(url, {
        headers: {
          Authorization: token || '',
        },
      })
        .then((response) => response.json())
        .then(
          (data) => {
            setProductTypes(data.productTypes);
          },
          (reason) => {
            console.error(reason);
            setError(reason);
          }
        );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    if (!productTypes && !loading && token) {
      getProductTypes();
    }
  }, [loading, token, getProductTypes, productTypes]);
  return { productTypes, getProductTypes, loading, error };
};

export const getConfigurations = async (
  authToken: string
): Promise<Configuration[]> => {
  try {
    const url = `${process.env.REACT_APP_API_HOST}configurations`;
    const res = await fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });
    const data = await res.json();
    return data;
  } catch (e) {
    throw e;
  }
};

export const getUploadUrl = async (
  meta: string,
  authToken: string,
  payload: { filename: string; contentType: string }
) => {
  try {
    const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/images/upload`;
    const res = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    // TODO
    console.log(e.message);
  }
};

export const createConfiguration = async (
  authToken: string
): Promise<Configuration> => {
  try {
    const url = `${process.env.REACT_APP_API_HOST}configurations`;
    const res = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });
    const data = await res.json();
    return data;
  } catch (e) {
    throw e;
  }
};

export const putConfiguration = async (
  authToken: string,
  meta: string,
  payload = {}
): Promise<any> => {
  try {
    const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}`;
    const res = await fetch(url, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    throw e;
  }
};

// Get a list of all configurations
// Get a single configuration with meta parameter
// New configuration
// Update / change the given configuration
// Deletes the given configuration
export const useConfigurations = (props: {
  meta?: string;
  callback?(meta?: string): void;
}) => {
  const { meta, callback } = props;
  const [tagsConfiguration, setTagsConfiguration] = useState<IConfiguration>();
  const [configurations, setConfigurations] = useState<IConfiguration[]>();
  const [configuration, setConfiguration] = useState<IConfiguration>();
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthToken();

  // Get a list of all configurations
  // GET HOST/dev/configurations
  // Get a single configuration with meta parameter
  // GET HOST/dev/configurations/{meta}
  const getConfiguration = useCallback(
    async (props: { id?: string; tags?: boolean }) => {
      const { id, tags } = props;
      setError('');
      if (!id || !tags || !loadingTags) {
        try {
          tags ? setLoadingTags(true) : setLoading(true);
          const url = id
            ? // tags ? `${process.env.REACT_APP_API_HOST}configurations/${id}?tags=true`:
              `${process.env.REACT_APP_API_HOST}configurations/${id}`
            : `${process.env.REACT_APP_API_HOST}configurations`;
          fetch(url, {
            headers: {
              Authorization: token || '',
            },
          })
            .then((response) => response.json())
            .then(
              (data) => {
                if (data.message || data.error) {
                  setError(data.message || data.error);
                  console.error('get configuration failed', data);
                  setLoading(false);
                } else {
                  console.info('configurations', data);
                  if (tags) {
                    setTagsConfiguration(data);
                  } else if (meta) {
                    setConfiguration(data);
                  } else {
                    setConfigurations(data);
                  }
                }
              },
              (reason) => {
                console.error(reason);
                setError(reason);
              }
            );
        } catch (e) {
          setError(e.message);
        } finally {
          setLoading(false);
          setLoadingTags(false);
        }
      }
    },
    [token, loadingTags, meta]
  );
  // New configuration
  // POST HOST/dev/configurations with either
  // empty payload or payload with {"name": "Your configuration name", products: []}
  // Products should be in format of {"id": "ShopifyProductID", "sku": "ShopifyProductSKU", "type": "Product/ProductVariant"}
  const newConfiguration = async (props: {
    payload: IConfigurationPayload;
  }) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations`;
      fetch(url, {
        method: 'post',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(props.payload),
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.error) {
              setError(data.error);
              console.error('new configuration failed', data);
              setLoading(false);
            } else {
              console.info('new configuration added', data);
              callback ? callback(data) : getConfiguration({});
            }
          },
          (reason) => {
            console.error(reason);
            setError(reason);
            setLoading(false);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  // Update / change the given configuration
  // PUT HOST/dev/configurations with either
  // empty payload or payload with {"name": "Your configuration name", products: []}
  // Products should be in format of {"id": "ShopifyProductID", "sku": "ShopifyProductSKU", "type": "Product/ProductVariant"}
  const updateConfiguration = async (props: {
    meta: string;
    payload: IConfigurationPayload;
    reload?: boolean;
  }) => {
    const { meta, payload, reload = true } = props;
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}`;
      fetch(url, {
        method: 'put',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.error);
              console.error('update configuration failed', data);
              setLoading(false);
            } else {
              console.info('updated configuration', data);
              callback ? callback(data) : reload && getConfiguration({});
            }
          },
          (reason) => {
            console.error(reason);
            setError(reason);
          }
        );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  // Deletes the given configuration
  // DELETE HOST/dev/configurations/{meta}
  const deleteConfiguration = async (meta: string) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}`;
      fetch(url, {
        method: 'delete',
        headers: {
          Authorization: token || '',
        },
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.message || data.error);
              console.error('get configuration failed', data);
              setLoading(false);
            } else {
              console.info('Configuration was deleted.', meta);
              getConfiguration({});
            }
          },
          (reason) => {
            console.error(reason);
            setError(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // duplicate the given configuration
  // POST HOST/configurations/{meta}/copy with either
  const duplicateConfiguration = async (callback?: Function, id?: string) => {
    try {
      setLoading(true);
      setError('');
      const url = id
        ? `${process.env.REACT_APP_API_HOST}configurations/${id}/copy`
        : `${process.env.REACT_APP_API_HOST}configurations/${meta}/copy`;
      fetch(url, {
        method: 'post',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.error) {
              setError(data.error);
              console.error('duplicate configuration failed', data);
              setLoading(false);
            } else {
              console.info('duplicate configuration', data);
              callback && callback(data?.meta);
            }
          },
          (reason) => {
            console.error(reason);
            setError(reason);
          }
        );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // sync the given configuration
  // POST HOST/configurations/{meta}/sync with either
  const syncConfiguration = async (callback?: Function, id?: string) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${
        id || meta
      }/sync`;
      const response = await fetch(url, {
        method: 'post',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        console.error('duplicate configuration failed', data);
        setLoading(false);
      } else {
        console.info('duplicate configuration', data);
        callback && callback(data?.meta);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      ((meta && !configuration) || (!meta && !configurations)) &&
      !loading &&
      token
    ) {
      getConfiguration({ id: meta });
    }
  }, [configuration, configurations, loading, token, meta, getConfiguration]);

  return {
    configuration,
    tagsConfiguration,
    configurations,
    getConfiguration,
    newConfiguration,
    updateConfiguration,
    deleteConfiguration,
    duplicateConfiguration,
    syncConfiguration,
    loading,
    loadingTags,
    error,
  };
};

// Add none or name and/or photo payloads to create a section.
// Update an existing section. Can have either / or name and photo payloads. sectionId should be the id property of a section.
// Remove / delete existing section. sectionId should be the id property of a section.
export const useSections = (props: {
  meta: string;
  callback?: VoidFunction;
}) => {
  const [loading, setLoading] = useState(false);
  const [errorUpdateSection, setError] = useState('');
  const { token } = useAuthToken();
  const { meta, callback } = props;

  // Add none or name and/or photo payloads to create a section.
  // POST configurations/{meta}/sections
  const newSection = async (payload: ISectionPayload) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections`;
      fetch(url, {
        method: 'post',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.message || data.error);
              console.error('New section failed', data);
              setLoading(false);
            } else {
              console.info('new section added', data);
              callback ? callback() : setError('Ok');
              console.info('new section added', data);
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  // Update an existing section. Can have either / or name and photo payloads. sectionId should be the id property of a section.
  // PUT configurations/{meta}/sections/{sectionId}
  const updateSection = async (props: {
    id: string;
    payload: ISectionPayload;
  }) => {
    const { id, payload } = props;
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/${id}`;
      fetch(url, {
        method: 'put',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.message || data.error);
              console.error('Update section failed', data);
              setLoading(false);
            } else {
              console.info('updated section', data);
              callback ? callback() : setError('Ok');
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  // Remove / delete existing section. sectionId should be the id property of a section.
  // DELETE configurations/{meta}/sections/{sectionId}
  const deleteSection = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/${id}`;
      fetch(url, {
        method: 'delete',
        headers: {
          Authorization: token || '',
        },
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.error || data.message);
              console.error('Delete section failed', data);
              setLoading(false);
            } else {
              console.info('Section was deleted.', id);
              callback ? callback() : setError('Ok');
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    newSection,
    updateSection,
    deleteSection,
    loading,
    errorUpdateSection,
  };
};

// Add/update/delete a option.
export const useOptions = (props: {
  meta: string;
  sectionId?: string;
  callback?: VoidFunction;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorSayduckOptions, setErrorSayduckOptions] = useState('');
  const { token } = useAuthToken();
  const { meta, sectionId, callback } = props;

  // Add none or name and/or photo payloads to create a option.
  // POST configurations/{meta}/sections/{sectionId}/options
  const newOption = async (payload: IOptionPayload) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/${sectionId}/options`;
      fetch(url, {
        method: 'post',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.error) {
              setError(data.error);
              console.error('New option failed', data);
              setLoading(false);
            } else {
              console.info('New option added', data);
              callback ? callback() : setError('Ok');
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  // Update an existing option.
  // PUT configurations/{meta}/sections/{sectionId}/options/{optionId}
  const updateOption = async (optionId: string, payload: IOptionPayload) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/${sectionId}/options/${optionId}`;
      fetch(url, {
        method: 'put',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.error || data.message);
              console.error('Update option failed', data);
              setLoading(false);
            } else {
              console.info('Updated option', data);
              callback ? callback() : setError('Ok');
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  // Remove / delete existing option.
  // DELETE configurations/{meta}/sections/{sectionId}/options/{optionId}
  const deleteOption = async (optionId: string) => {
    try {
      setLoading(true);
      setError('');
      const url = `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/${sectionId}/options/${optionId}`;
      fetch(url, {
        method: 'delete',
        headers: {
          Authorization: token || '',
        },
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.message !== 'Ok') {
              setError(data.message || data.error);
              console.error('Update option failed', data);
              setLoading(false);
            } else {
              console.info('Option was deleted.', optionId);
              callback ? callback() : setError('Ok');
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  // Get Sayduck options for ids selection
  // POST https://api.sayduck.io/graphql
  const getSayduckOptions = async (props: {
    sayduckCallback?(sayduckOptions: []): void,
    productId?: string,
  }) => {
    try {
      const {productId, sayduckCallback} = props;
      setLoading(true);
      setErrorSayduckOptions("");
      fetch("https://api.sayduck.io/graphql", {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(
        {
          query: `query GetPublicProduct {
            publicProduct(uuid: "${productId}") {
              name
              model {
                liveConfigurations {
                  nodes {
                    name
                    uuid
                    liveVariants {
                      nodes {
                        name
                        uuid
                      }
                    }
                    parent {
                      name
                      uuid
                    }
                  }
                }
              }
            }
          }`
        })
      })
        .then((response) => response.json())
        .then(
          (data) => {
            if (data.errors) {
              setErrorSayduckOptions(data.error);
              console.error('Sayduck fetch failed', data);
              setLoading(false);
            } else {
              console.info('Sayduck ids: ', data);
              sayduckCallback ? sayduckCallback(data.data?.publicProduct?.model?.liveConfigurations?.nodes) : setErrorSayduckOptions("Ok");
            }
          },
          (reason) => {
            console.error(reason);
          }
        );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return {
    newOption,
    updateOption,
    deleteOption,
    getSayduckOptions,
    loading,
    error,
    errorSayduckOptions,
  };
};

// Upload, and get images in configuration
export const useImages = (props: {
  meta: string;
  image?: string;
  callback?(meta: string, file?: string): void;
  sectionId?: string;
}) => {
  const { meta, callback, sectionId } = props;
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthToken();

  const getThumbnail = async (props: { photoSrc: string; size?: string }) => {
    const { photoSrc, size = 'medium' } = props;
    try {
      const image = `${process.env.REACT_APP_API_HOST}images/${photoSrc}?size=${
        size || 'medium'
      }`;
      callback && callback(meta, image);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImages(false);
    }
  };

  // POST configurations/{meta}/images/upload endpoint is used as follows:
  // Request a signed upload url by sending a POST request to above endpoint with auth token in authorization header.
  // Request needs to have as payload the filename and contentType of the file to be uploaded (obtained for example via Polaris Dropzone.FileUpload component).
  // Then you get a response back with a signedUrl url and file (string of the filename). Send a PUT request to that url with the payload of your file.
  const getUploadUrl = async (meta: string, payload: IImagePayload) => {
    try {
      const url = sectionId
        ? `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/images/upload`
        : `${process.env.REACT_APP_API_HOST}configurations/${meta}/images/upload`;
      const res = await fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      setError(e.message);
    } finally {
    }
  };

  const uploadImage = async (meta: string, imageFile: File) => {
    try {
      setLoadingImages(true);
      const { name: filename, type: contentType } = imageFile;
      const { signedUrl, file } = await getUploadUrl(meta, {
        filename,
        contentType,
      });
      await fetch(signedUrl, {
        method: 'put',
        headers: { 'Content-Type': contentType },
        body: imageFile,
      });
      callback && callback(meta, file);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImages(false);
    }
  };

  return {
    getThumbnail,
    uploadImage,
    loadingImages,
    error,
  };
};

// Get a list of all collections
//
// GET HOST/dev/products
export const useCollections = (limit: number = 0) => {
  const [collections, setCollections] = useState<IPagedCollections>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthToken();

  const fetchCollections = useCallback(
    async (props: {limit: number, path?: string, query?: string}) => {
      const {limit = 0, path, query} = props;
      try {
        setLoading(true);
        let url = path
          ? `${path}`
          : limit > 0
          ? `${process.env.REACT_APP_API_HOST}collections?limit=${limit}&search=${query}`
          : `${process.env.REACT_APP_API_HOST}collections`;
        fetch(url, {
          headers: {
            Authorization: token || '',
          },
        })
          .then((response) => response.json())
          .then(
            (data) => {
              console.info('collections:', data);
              setCollections(data.collections);
            },
            (reason) => {
              console.error(reason);
              setError(reason);
            }
          );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    if (!collections && !loading && token) {
      fetchCollections({limit: limit});
    }
  }, [loading, token, collections, fetchCollections, limit]);

  return { collections, fetchCollections, loading, error };
};
