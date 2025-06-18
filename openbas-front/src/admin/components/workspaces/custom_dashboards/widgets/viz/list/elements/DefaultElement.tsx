import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {CSSProperties} from '@mui/material/styles';
import {makeStyles} from 'tss-react/mui';

import {EsBase, type EsEndpoint} from '../../../../../../../../utils/api-types';
import {Link} from "react-router";
import { DevicesOtherOutlined } from '@mui/icons-material';
import useBodyItemsStyles from "../../../../../../../../components/common/queryable/style/style";
type Props = {
    columns: string[];
    element: EsBase;
};

export const inlineStyles: Record<string, CSSProperties> = {};

const DefaultElement = (props: Props) => {
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
    const bodyItemsStyles = useBodyItemsStyles();

    const elementsFromColumn = (column: string) => {
        switch (column) {
            default: return (endpoint: EsEndpoint) => {
                let key = column as keyof typeof endpoint;
                return endpoint[key];
            };
        }
    }

    return (
        <>
            <ListItemButton component={Link}
                            to={`/admin/assets/endpoints/${props.element.base_id}`}
                            classes={{ root: classes.item }} className="noDrag">
                <ListItemIcon>
                    <DevicesOtherOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                    primary={(
                        <div style={bodyItemsStyles.bodyItems}>
                            {props.columns.map(col => (
                                <div
                                    key={col}
                                    style={{
                                        ...bodyItemsStyles.bodyItem,
                                        ...inlineStyles[col],
                                    }}
                                >
                                    {elementsFromColumn(col)(props.element)}
                                </div>
                            ))}
                        </div>
                    )}
                />
            </ListItemButton>
        </>
    );
};

export default DefaultElement;
