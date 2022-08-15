import { Redirect, Route, Switch } from "react-router";
import DashboardView from "./views/Dashboard";
import ConfigurationsView from "./views/Configurations/Configurations";
import CreateConfigurationView from "./views/Configurations/CreateConfiguration";
import ShowConfigurationView from "./views/Configurations/ShowConfiguration";
import ProductsView from "./views/Products";
import IkeaView from "./views/Ikea";
import Install from "./views/Install";
import EditActions from "./views/Configurations/Actions/EditActions";

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={DashboardView} />
      <Route exact path="/products" component={ProductsView} />
      <Route exact path="/configurations" component={ConfigurationsView} />
      <Route
        exact
        path="/configurations/new"
        component={CreateConfigurationView}
      />
      <Route
        exact
        path="/configurations/:meta"
        component={ShowConfigurationView}
      />
      <Route
        exact
        path="/configurations/:meta/sections/:sectionId/options/:optionId/actions"
        component={EditActions}
      />
      <Route exact path="/ikea" component={IkeaView} />
      <Route path="/install" component={Install} />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
