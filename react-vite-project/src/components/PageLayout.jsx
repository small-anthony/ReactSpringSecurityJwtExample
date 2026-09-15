import {Outlet} from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import './PageLayout.css'
function PageLayout ({user}) {
  return (
    <div id="pagelayout" className="pageLayout">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
export default PageLayout;
