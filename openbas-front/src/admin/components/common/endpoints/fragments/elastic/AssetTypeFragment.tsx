import {EsEndpoint} from "../../../../../../utils/api-types";
import PlatformIcon from "../../../../../../components/PlatformIcon";
import {useTheme} from "@mui/material/styles";
import {useFormatter} from "../../../../../../components/i18n";
import ItemTags from "../../../../../../components/ItemTags";
import {makeStyles} from "tss-react/mui";
import {Chip, Tooltip} from "@mui/material";

type Props = {
    endpoint: EsEndpoint
}

const AssetPlatformFragment = (props: Props) =>  {
    const useStyles = makeStyles()(() => ({
        typeChip: {
            height: 20,
            borderRadius: 4,
            textTransform: 'uppercase',
            width: 100,
            marginBottom: 5,
        },
    }));

    const { classes } = useStyles();
    return (
        <Tooltip title={props.endpoint.base_entity}>
            <Chip
                variant="outlined"
                className={classes.typeChip}
                label={props.endpoint.base_entity}
            />
        </Tooltip>
    );
}

export default AssetPlatformFragment;