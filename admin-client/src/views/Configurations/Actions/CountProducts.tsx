import { TextField, Layout, Icon, Autocomplete, Tag } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { OptionDescriptor } from "@shopify/polaris/dist/types/latest/src/components/OptionList";
import { useState } from "react";

type PropsType = {
  filterId: string;
  productTypes: OptionDescriptor[] | [];
  updateActionList: Function;
  initialType?: string;
  initialPCSValue?: string;
};

const ActionCountProducts = (props: PropsType) => {
  const {
    filterId,
    productTypes,
    updateActionList,
    initialType = "",
    initialPCSValue = "",
  } = props;

  const [selectedProductType, setSelectedProductType] = useState(
    initialType ? [initialType] : []
  );
  const [valuePCS, setValuePCS] = useState(initialPCSValue);
  const [typeInputValue, setTypeInputValue] = useState("");
  const [optionsType, setOptionsType] =
    useState<OptionDescriptor[]>(productTypes);

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

  const handleSelectProductTypeChange = (selected: any) => {
    setSelectedProductType(selected);
    setTypeInputValue("");
    updateActionList({
      id: filterId,
      productType: selected[0],
      count: "",
    });
  };

  const removeTypeTag = () => {
    setSelectedProductType([]);
    setOptionsType(productTypes);
    setValuePCS("");
    updateActionList({
      id: filterId,
      productType: "",
      count: "",
    });
  };

  const handleSelectPcsChange = (value: string) => {
    setValuePCS(value);
    updateActionList({
      id: filterId,
      productType: selectedProductType[0],
      count: value,
    });
  };

  const textFieldTypes = (
    <Autocomplete.TextField
      onChange={updateText}
      label=""
      value={typeInputValue}
      placeholder={selectedProductType.length > 0 ? "" : "Product type"}
      autoFocus
      prefix={<Icon source={SearchMinor} color="base" />}
    />
  );

  return (
    <Layout>
      <Layout.Section>
        <div style={{ display: "flex", gap: "1rem", maxWidth: "100%" }}>
          <div
            style={{
              maxWidth: "41rem",
              width: "calc(100% - 8rem)",
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
          <div style={{ maxWidth: "8rem" }}>
            <TextField
              label=""
              disabled={!selectedProductType}
              suffix="PCS"
              inputMode="numeric"
              align="right"
              maxLength={2}
              value={valuePCS}
              onChange={handleSelectPcsChange}
              placeholder=""
            />
          </div>
        </div>
      </Layout.Section>
    </Layout>
  );
};

export default ActionCountProducts;
