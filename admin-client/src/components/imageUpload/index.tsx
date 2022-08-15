import {
  Thumbnail,
  TextStyle,
  Caption,
  Image,
  DropZone,
} from "@shopify/polaris";
import { NoteMajor } from "@shopify/polaris-icons";

const ImageUpload = (props: {
  file: File | undefined;
  initialImage?: string;
}) => {
  const { file, initialImage } = props;

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  return initialImage || file ? (
    <div
      style={{
        display: "flex",
        marginBottom: "0.5rem",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          alignItems: "center",
        }}
      >
        {initialImage || (file && validImageTypes.includes(file.type)) ? (
          <>
            <Image
              width={"100%"}
              alt={"Preview image"}
              source={
                (file && window.URL.createObjectURL(file)) ||
                (initialImage && initialImage) ||
                ""
              }
            />
            <span style={{ color: "#2C6ECB", marginTop: "0.5rem" }}>
              Change image
            </span>
          </>
        ) : (
          file && (
            <>
              <div style={{ marginBottom: "0.5rem" }}>
                <TextStyle variation="strong">File is not supported</TextStyle>
              </div>
              <Thumbnail size="large" alt={file.name} source={NoteMajor} />
              <div>
                {file.name} <Caption>{file.size} bytes</Caption>
              </div>
            </>
          )
        )}
      </div>
    </div>
  ) : (
    <DropZone.FileUpload />
  );
};

export default ImageUpload;
