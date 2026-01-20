import { basicInfo } from "../docs/basicInfo";
import { components } from "../docs/components";
import { paths } from "../docs/paths";

const swaggerOptions = {
    ...basicInfo,
    components,
    paths,
};

export default swaggerOptions;
