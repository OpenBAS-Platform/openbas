import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {CSSProperties} from '@mui/material/styles';
import {makeStyles} from 'tss-react/mui';

import {EsBase, type EsEndpoint} from '../../../../../../../../utils/api-types';
import useBodyItemsStyles from "../../../../../../../../components/common/queryable/style/style";
import { Description } from '@mui/icons-material';

const useStyles = makeStyles()(() => ({
    itemHead: { textTransform: 'uppercase' },
    item: { height: 50 },
}));

type Props = {
    columns: string[];
    element: EsBase;
};

export const inlineStyles = new Proxy({}, {
    get: (target: Record<string, CSSProperties>, name: string) => name in target ? target[name] : { width: "10%" }
})

const DefaultListElement = (props: Props) => {
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
            <ListItemButton classes={{ root: classes.item }} className="noDrag">
                <ListItemIcon>
                    <Description color="primary" />
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

export default DefaultListElement;
