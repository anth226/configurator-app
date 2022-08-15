import { Spinner } from "@shopify/polaris";
import classes from "./Loading.module.css";

const Loading = (props: { text?: string }) => {
  return (
    <div className={classes.container}>
      <Spinner accessibilityLabel="Loading app" size="large" />
      {props.text && <span style={{ marginLeft: "1rem" }}>{props.text}</span>}
    </div>
  );
};

export default Loading;
