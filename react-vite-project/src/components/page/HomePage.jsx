import {useTranslation} from "react-i18next";

const HomePage = ({user, options}) => {
    const t = useTranslation(["main"]);

    function GenerateExampleButton(text) {
        return (
            <div className={""}>
                {text}
            </div>
        );
    }

    return (
        <div className={"flex flex-col flex-1"}>
            <div className={"flex flex-1"}>
                <div className={"flex flex-col flex-1/6"}>
                    <div className={"flex-1/2 flex flex-col"} style={{backgroundColor: "red"}}>
                        {GenerateExampleButton("Mes offres")}
                    </div>
                    <hr/>
                    <div className={"flex-1/2"} style={{backgroundColor: "teal"}}>
                        <h1 className={"text-center"}>Aucune notification</h1>
                    </div>
                </div>
                <div className={"flex-5/6"}>
                </div>
            </div>
        </div>
    );
}

export default HomePage;

