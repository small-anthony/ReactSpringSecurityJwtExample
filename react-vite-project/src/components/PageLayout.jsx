import {Outlet} from "react-router-dom";
import Header from "./Header.jsx";
import './PageLayout.css'
function PageLayout ({user}) {
  return (
    <div id="pagelayout" className="pageLayout">
      <Header user={user}/>
      <Outlet />
    </div>
  );
}
export default PageLayout;
