import {ListItemText, ListItemButton, Tooltip, Chip} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {EsEndpoint} from "../../../../../../../../utils/api-types";
import ItemTags from "../../../../../../../../components/ItemTags";
import PlatformIcon from "../../../../../../../../components/PlatformIcon";
import {makeStyles} from "tss-react/mui";


type Props = {
    columns: string[];
    element: EsEndpoint;
}

const EndpointElement = (props: Props) => {
    const useStyles = makeStyles()(() => ({
        item: { height: 50 },
        bodyItem: {
            fontSize: 13,
            float: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        typeChip: {
            height: 20,
            borderRadius: 4,
            textTransform: 'uppercase',
            width: 100,
            marginBottom: 5,
        },
    }));
    const { classes } = useStyles();

    const headers = [
        {
            field: 'asset_name',
            label: 'Name',
            isSortable: true,
            value: (endpoint: EsEndpoint) => endpoint.endpoint_name,
        },
        {
            field: 'asset_platform',
            label: 'Platform',
            isSortable: true,
            value: (endpoint: EsEndpoint) => (
                <>
                    <PlatformIcon platform={endpoint.endpoint_platform ?? 'Unknown'} width={20} marginRight={theme.spacing(2)} />
                    {endpoint.endpoint_platform}
                </>
            ),
        },
        {
            field: 'asset_tags',
            label: 'Tags',
            isSortable: false,
            value: (endpoint: EsEndpoint) => (
                <ItemTags variant="reduced-view" tags={endpoint.base_tags_side} />
            ),
        },
        {
            field: 'asset_type',
            label: 'Type',
            isSortable: false,
            value: (endpoint: EsEndpoint) => (
                <Tooltip title="Endpoint">
                    <Chip
                        variant="outlined"
                        className={classes.typeChip}
                        label="Endpoint"
                    />
                </Tooltip>
            ),
        },
    ];
    
    const theme = useTheme();

    return (
        <>
            <ListItemButton dense={true}>
            <PlatformIcon platform={props.element.endpoint_platform || 'Unknown'} width={20} marginRight={theme.spacing(2)} />
            {props.element.endpoint_platform}
            <ListItemText>Endpoint {props.element.base_representative}: {props.element.endpoint_arch} <ItemTags  tags={props.element.base_tags_side}/></ListItemText>
            </ListItemButton>
        </>
    )
}

export default EndpointElement;