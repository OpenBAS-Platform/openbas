import {EndpointOutput} from "../../../../../../utils/api-types";
import {Chip, Tooltip} from "@mui/material";
import {makeStyles} from "tss-react/mui";

type Props = {
    endpoint: EndpointOutput
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
        <Tooltip title={props.endpoint.asset_type}>
            <Chip
                variant="outlined"
                className={classes.typeChip}
                label={props.endpoint.asset_type}
            />
        </Tooltip>
    );
}

export default AssetPlatformFragment;