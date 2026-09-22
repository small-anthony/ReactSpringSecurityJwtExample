import {useTranslation} from "react-i18next";

const HomePage = ({user}) => {
    const t = useTranslation(["main"]);

    return (
        <div>
            <h1>Hello User</h1>
        </div>
    );
}

export default HomePage;

