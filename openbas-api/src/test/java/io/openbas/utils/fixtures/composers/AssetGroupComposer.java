package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.AssetGroup;
import io.openbas.database.repository.AssetGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AssetGroupComposer extends ComposerBase<AssetGroup> {
    @Autowired private AssetGroupRepository assetGroupRepository;

    public class Composer extends InnerComposerBase<AssetGroup> {
        private final AssetGroup assetGroup;

        public Composer(AssetGroup assetGroup) {
            this.assetGroup = assetGroup;
        }


        @Override
        public Composer persist() {
            assetGroupRepository.save(assetGroup);
            return this;
        }

        @Override
        public Composer delete() {
            assetGroupRepository.delete(assetGroup);
            return this;
        }

        @Override
        public AssetGroup get() {
            return this.assetGroup;
        }
    }

    public Composer forAssetGroup(AssetGroup assetGroup) {
        generatedItems.add(assetGroup);
        return new Composer(assetGroup);
    }
}
