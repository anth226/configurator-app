import {
  Stack,
  Layout,
  Autocomplete,
  Icon,
  Tag,
  TextStyle,
} from "@shopify/polaris";
import {
  SearchMinor,
  EnableSelectionMinor,
  CancelSmallMinor,
} from "@shopify/polaris-icons";
import { OptionDescriptor } from "@shopify/polaris/dist/types/latest/src/components/OptionList";
import { useEffect, useState } from "react";
import { IProduct } from "../../../api/interfaces";

type PropsType = {
  filterId: string;
  discard?: boolean;
  products?: IProduct[];
  productTypes: OptionDescriptor[] | [];
  updateActionList: Function;
  initialType?: string;
  initialFeatures?: string[];
};

const ActionFilterProducts = (props: PropsType) => {
  const {
    filterId,
    productTypes,
    updateActionList,
    initialType = "",
    initialFeatures = [],
  } = props;
  const { products } = props;
  const [selectedProductType, setSelectedProductType] = useState<string[]>(
    initialType && initialType.length > 0 ? [initialType] : []
  );
  const [selectedFeature, setSelectedFeature] =
    useState<string[]>(initialFeatures);
  const [optionsType, setOptionsType] =
    useState<OptionDescriptor[]>(productTypes);
  const [typeInputValue, setTypeInputValue] = useState("");
  const [featureInputValue, setFeatureInputValue] = useState("");
  const [allFeatureOptions, setAllFeatureOptions] = useState<
    OptionDescriptor[]
  >([]);
  const [featureArray, setFeatureArray] = useState<
    | {
        id: string;
        title: string;
        tags: string;
      }[]
    | undefined
  >();
  const [filteredFeatures, setFilteredFeatures] = useState<string[]>([]);

  useEffect(() => {
    const matchedItems = products?.filter((item) => {
      return selectedProductType[0] === item.productType;
    });
    const options = matchedItems?.map((item) => {
      const tags = item.tags?.filter(
        (x) =>
          x.startsWith("_color__") ||
          x.startsWith("_material__") ||
          x.startsWith("_product_line__")
      );
      const title =
        item.title === "Default Title" &&
        item.sku &&
        item.sku.length > 8 &&
        item.sku.length <= 12
          ? item.sku.substr(4, 5).replace("-", " X ") + "\u2003"
          : item.title === "Default Title"
          ? ""
          : item.title + "\u2003";
      const startSpace = title.length > 0 && title.length < 9 ? "\xa0" : "";
      return {
        label:
          startSpace +
          title +
          tags
            ?.join("\u2003")
            .replace("_color__", "")
            .replace("_material__", "")
            .replace("_product_line__", "") +
          "\u2003" +
          item.sku,
        value: item.id,
      };
    });
    setFeatureArray(
      matchedItems?.map((item) => {
        const title =
          item.title === "Default Title" &&
          item.sku &&
          item.sku.length > 8 &&
          item.sku.length <= 12
            ? item.sku.substr(4, 5).replace("-", " X ")
            : item.title === "Default Title"
            ? ""
            : item.title;
        const tags = item.tags?.filter(
          (x) =>
            x.startsWith("_color__") ||
            x.startsWith("_material__") ||
            x.startsWith("_product_line__")
        );
        return {
          id: item.id,
          title: title,
          tags: tags
            ?.join(" ")
            .replace("_color__", "")
            .replace("_material__", "")
            .replace("_product_line__", ""),
        };
      })
    );
    const filteredOptions =
      options && options.length > 1
        ? options[0].value !== "selectAll" && options[0].value !== "clearAll"
          ? [
              {
                label: (
                  <div style={{ marginLeft: "-1.7rem" }}>
                    <TextStyle variation="strong">Select all</TextStyle>
                  </div>
                ),
                value: "selectAll",
                media: (
                  <div style={{ marginLeft: "-5.2rem" }}>
                    <Icon source={EnableSelectionMinor} />
                  </div>
                ),
              },
              {
                label: (
                  <div style={{ marginLeft: "-1.7rem" }}>
                    <TextStyle variation="strong">Unselect all</TextStyle>
                  </div>
                ),
                value: "clearAll",
                media: (
                  <div style={{ marginLeft: "-5.2rem" }}>
                    <Icon source={CancelSmallMinor} />
                  </div>
                ),
              },
              ...options,
            ]
          : [...options]
        : options && options.length === 1
        ? [...options]
        : [];
    setAllFeatureOptions(filteredOptions);
    setOptionsFeature(filteredOptions);
    setFilteredFeatures(matchedItems?.map((item) => item.id) || []);
  }, [selectedProductType]); // eslint-disable-line react-hooks/exhaustive-deps

  const [optionsFeature, setOptionsFeature] = useState(allFeatureOptions);

  const updateText = (value: any) => {
    setTypeInputValue(value);

    if (value === "") {
      setOptionsType(productTypes);
      return;
    }

    const filterRegex = new RegExp(value, "i");
    const resultOptions = productTypes.filter((option) =>
      option?.value?.match(filterRegex)
    );
    setOptionsType(resultOptions);
  };

  const updateFeatureText = (value: string) => {
    setFeatureInputValue(value);

    if (value.match(/["",?,.,*]/g)) {
      setOptionsFeature(allFeatureOptions);
      return;
    }

    const filterRegex = new RegExp(value, "i");

    const resultOptions = allFeatureOptions?.filter((option) =>
      option?.label?.toString()?.match(filterRegex)
    );

    const filteredOptions =
      resultOptions && resultOptions.length > 1
        ? resultOptions[0].value !== "selectAll" &&
          resultOptions[0].value !== "clearAll"
          ? [
              {
                label: (
                  <div style={{ marginLeft: "-1.7rem" }}>
                    <TextStyle variation="strong">
                      Select all from results
                    </TextStyle>
                  </div>
                ),
                value: "selectAll",
                media: (
                  <div style={{ marginLeft: "-5.2rem" }}>
                    <Icon source={EnableSelectionMinor} />
                  </div>
                ),
              },
              {
                label: (
                  <div style={{ marginLeft: "-1.7rem" }}>
                    <TextStyle variation="strong">
                      Unselect all from results
                    </TextStyle>
                  </div>
                ),
                value: "clearAll",
                media: (
                  <div style={{ marginLeft: "-5.2rem" }}>
                    <Icon source={CancelSmallMinor} />
                  </div>
                ),
              },
              ...resultOptions,
            ]
          : [...resultOptions]
        : resultOptions && resultOptions.length === 1
        ? [...resultOptions]
        : [];
    setOptionsFeature(filteredOptions);
    setFilteredFeatures(resultOptions?.map((item) => item.value) || []);
  };

  const handleSelectProductTypeChange = (selected: any) => {
    setSelectedProductType(selected);
    setTypeInputValue("");
  };

  useEffect(() => {
    updateActionList({
      id: filterId,
      productFeatures: selectedFeature,
      productType: selectedProductType[0],
    });
  }, [selectedFeature, selectedProductType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectFeatureChange = (selected: string[]) => {
    if (selected.includes("clearAll")) {
      setSelectedFeature(
        selectedFeature.filter((x) => !filteredFeatures.includes(x))
      );
    } else if (
      selected.includes("selectAll") &&
      products &&
      products.length > 0
    ) {
      if (selectedFeature.length === allFeatureOptions.length) {
        setSelectedFeature(
          allFeatureOptions
            .filter(
              (item) => item.value !== "selectAll" && item.value !== "clearAll"
            )
            .map((item) => item.value)
        );
      } else {
        setSelectedFeature([
          ...new Set([
            ...selectedFeature,
            ...filteredFeatures.filter(
              (item) => item !== "selectAll" && item !== "clearAll"
            ),
          ]),
        ]);
      }
    } else {
      setSelectedFeature(selected);
      setFeatureInputValue(featureInputValue);
    }
  };

  const removeTypeTag = () => {
    setSelectedProductType([]);
    setOptionsType(productTypes);
    setSelectedFeature([]);
    updateActionList({
      id: filterId,
      productType: "",
      productFeatures: [],
    });
    setFeatureInputValue("");
  };

  const removeFeatureTag = (tag: string) => {
    const options = [...selectedFeature];
    options.splice(options.indexOf(tag), 1);
    setSelectedFeature(options);
  };

  const textFieldTypes = (
    <Autocomplete.TextField
      onChange={updateText}
      label=""
      value={typeInputValue}
      placeholder={selectedProductType.length > 0 ? "" : "Product type"}
      prefix={<Icon source={SearchMinor} color="base" />}
      autoFocus
    />
  );

  const textFieldFeatures = (
    <Autocomplete.TextField
      onChange={updateFeatureText}
      label=""
      value={featureInputValue}
      placeholder={
        selectedProductType.length < 1
          ? "Select product type first"
          : allFeatureOptions.length === 0
          ? "No parts of this type"
          : props.discard
          ? "Discarded parts"
          : "Included parts"
      }
      prefix={
        allFeatureOptions.length > 0 && (
          <Icon source={SearchMinor} color="base" />
        )
      }
      disabled={allFeatureOptions.length === 0}
    />
  );

  return (
    <Layout>
      <Layout.Section>
        <Stack vertical distribution="fillEvenly">
          <div
            style={{
              width: "100%",
              maxWidth: "50rem",
            }}
          >
            {selectedProductType.length === 0 ? (
              <Autocomplete
                options={optionsType || []}
                onSelect={handleSelectProductTypeChange}
                selected={selectedProductType}
                textField={textFieldTypes}
                listTitle="Product types"
              />
            ) : (
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "0.3rem",
                  borderRadius: "0.4rem",
                }}
              >
                <Tag key={"typeTag"} onRemove={() => removeTypeTag()}>
                  {selectedProductType[0]}
                </Tag>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexFlow: "column",
              width: "100%",
              maxWidth: "50rem",
            }}
          >
            <Autocomplete
              allowMultiple
              options={optionsFeature || []}
              onSelect={handleSelectFeatureChange}
              selected={selectedFeature}
              textField={textFieldFeatures}
              listTitle="Parts"
            />
          </div>
          <div style={{ margin: "0.4rem 1rem 0.4rem 0" }}>
            <Stack spacing="extraTight">
              {selectedFeature.map((element) => {
                const tagData = featureArray?.find((x) => x.id === element);
                return (
                  <Tag
                    key={"typeTag-" + element}
                    onRemove={() => removeFeatureTag(element as never)}
                  >
                    {tagData && tagData.title + " " + tagData.tags}
                  </Tag>
                );
              })}
            </Stack>
          </div>
        </Stack>
      </Layout.Section>
    </Layout>
  );
};

export default ActionFilterProducts;
