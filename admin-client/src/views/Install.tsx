import { useCallback, useEffect } from "react";
import { install } from "../api/api";
import Loading from "../components/loading/Loading";
import useQueryParams from "../hooks/useQueryParams";

const Install = () => {
  const queryParams = useQueryParams();
  const initInstall = useCallback(async () => {
    try {
      await install(queryParams);
    } catch (e) {
      console.error(e);
    }
  }, [queryParams]);

  useEffect(() => {
    initInstall();
  }, [initInstall]);

  return <Loading text="Installing Configurator..." />;
};

export default Install;
