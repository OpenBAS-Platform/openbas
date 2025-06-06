import { describe, expect, it } from 'vitest';
import { mockStoreMethodWithReturn } from '../../fixtures/mock';
import ExportButton from '../../../components/common/ExportButton';
import { act, render } from '@testing-library/react'; // @testing-library/dom is needed as well as it is a peer dependency of @testing-library/react
import {createDefaultTags, createTagMap} from "../../fixtures/api-types.fixtures";
import { faker } from '@faker-js/faker';
import TestRootComponent from "../../fixtures/TestRootComponent";
import React from "react";

/* eslint-disable  @typescript-eslint/no-explicit-any */
type testobj = { [key: string]: any };
function createObjWithDefaultKeys(objtype: string): testobj {
    const obj: testobj = {};
    ['name', 'extra_prop_1', 'extra_prop_2'].forEach((prop) => {
        obj[`${objtype}_${prop}`] = faker.lorem.sentence();
    });
    return obj;
}

describe('Generic export button', () => {
    const exportType: string = "testobj"
    const exportData: testobj[] = [
        createObjWithDefaultKeys(exportType),
        createObjWithDefaultKeys(exportType),
        createObjWithDefaultKeys(exportType)
    ]
    const numberOfElements : number = exportData.length;
    const exportKeys = [
        `${exportType}_name`,
        `${exportType}_tags`,
    ];
    const tags = createDefaultTags(5);
    const tagMap = createTagMap(tags);
    for(let obj of exportData) {
        obj[`${exportType}_tags`] = tags.map(t => t.tag_id);
    }

    mockStoreMethodWithReturn("getTagsMap", tagMap);

    it("does something", async () => {
        const { getByRole } = render(
            <TestRootComponent>
                <ExportButton key="tutut" totalElements={numberOfElements} exportProps={{
                    exportType: exportType,
                    exportKeys: exportKeys,
                    exportData: exportData,
                    exportFileName: "export.csv"
                }}/>
            </TestRootComponent>
        );
        await act(async () => {
            const firstname = getByRole("link");
            if (firstname.onclick) {
                const toto = await firstname.onclick(new MouseEvent("click"))
                console.log("here it is");
                console.log(firstname.getAttribute("href"))
            }

            expect(firstname).toBeDefined();
        });
    });
});