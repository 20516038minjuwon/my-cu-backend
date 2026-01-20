import { authPaths } from "./auth.paths";
import { adminUserPaths } from "./admin.user.paths";

export const paths = {
    ...authPaths,
    ...adminUserPaths,
};
