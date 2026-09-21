import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import './PageLayout.css';

function PageLayout({ user }) {
  return (
    <div id="pagelayout" className="pageLayout min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 flex flex-col justify-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;
