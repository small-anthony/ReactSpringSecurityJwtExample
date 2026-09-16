import {Outlet} from "react-router-dom";
import Header from "./Header.jsx";
import './PageLayout.css'
import SidePanel from "./widget/SidePanel.tsx";
function PageLayout ({user}) {
  return (
    <div id="pagelayout" className="pageLayout flex flex-col">
        <Header user={user}/>
        <div className={"flex-1 grid grid-flow-row grid-cols-12"}>
            <div className={"col-span-2"}>
                <SidePanel />
            </div>
            <div className={"col-span-10"}>
                <Outlet/>
            </div>
        </div>
    </div>
  );
}
export default PageLayout;
