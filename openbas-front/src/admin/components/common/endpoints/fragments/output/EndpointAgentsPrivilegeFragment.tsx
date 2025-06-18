import {EndpointOutput} from "../../../../../../utils/api-types";
import {useFormatter} from "../../../../../../components/i18n";
import {Tooltip} from "@mui/material";
import AgentPrivilege from "../../../../assets/endpoints/AgentPrivilege";

type Props = {
    endpoint: EndpointOutput
}

const EndpointAgentsPrivilegeFragment = (props: Props) =>  {
    const { t } = useFormatter();

    const getPrivilegesCount = (endpoint: EndpointOutput) => {
        if (endpoint.asset_agents.length > 0) {
            const privileges = endpoint.asset_agents.map(agent => agent.agent_privilege);
            const privilegeCount = privileges?.reduce((count, privilege) => {
                if (privilege === 'admin') {
                    count.admin += 1;
                } else {
                    count.user += 1;
                }
                return count;
            }, {
                admin: 0,
                user: 0,
            });

            return {
                adminCount: privilegeCount?.admin,
                userCount: privilegeCount?.user,
            };
        } else {
            return {
                adminCount: 0,
                userCount: 0,
            };
        }
    };

    const privileges = getPrivilegesCount(props.endpoint);

    return (
        <>
            <Tooltip title={t('Admin') + `: ${privileges.adminCount}`} placement="top">
            <span>
              {privileges.adminCount > 0 && (<AgentPrivilege variant="list" privilege="admin" />)}
            </span>
            </Tooltip>
            <Tooltip title={t('User') + `: ${privileges.userCount}`} placement="top">
            <span>
              {privileges.userCount > 0 && (<AgentPrivilege variant="list" privilege="user" />)}
            </span>
            </Tooltip>
            {
                props.endpoint.asset_agents.length === 0 && (
                    <span>{t('N/A')}</span>
                )
            }
        </>
    );
}

export default EndpointAgentsPrivilegeFragment;