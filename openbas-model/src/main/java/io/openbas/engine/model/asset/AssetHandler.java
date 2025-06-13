package io.openbas.engine.model.asset;

import static io.openbas.engine.EsUtils.buildRestrictions;

import io.openbas.database.raw.RawAsset;
import io.openbas.database.repository.AssetRepository;
import io.openbas.engine.Handler;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AssetHandler implements Handler<EsAsset> {

  private AssetRepository assetRepository;

  @Autowired
  public void setAssetRepository(AssetRepository assetRepository) {
    this.assetRepository = assetRepository;
  }

  @Override
  public List<EsAsset> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawAsset> forIndexing = assetRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
            asset -> {
              EsAsset esAsset = new EsAsset();
              // Base
              esAsset.setBase_id(asset.getAsset_id());
              esAsset.setBase_representative(asset.getAsset_name());
              esAsset.setBase_created_at(asset.getAsset_created_at());
              esAsset.setBase_updated_at(asset.getAsset_updated_at());
              // not sure what to put here, if anything
              esAsset.setBase_restrictions(buildRestrictions(asset.getAsset_id()));

              esAsset.setAsset_type(asset.getAsset_type());
              esAsset.setAsset_description(asset.getAsset_description());
              esAsset.setAsset_external_reference(asset.getAsset_external_reference());

              esAsset.setEndpoint_ips(asset.getEndpoint_ips());
              esAsset.setEndpoint_hostname(asset.getEndpoint_hostname());
              esAsset.setEndpoint_platform(asset.getEndpoint_platform());
              esAsset.setEndpoint_arch(asset.getEndpoint_arch());
              esAsset.setEndpoint_mac_addresses(asset.getEndpoint_mac_addresses());
              esAsset.setEndpoint_seen_ip(asset.getEndpoint_seen_ip());

              esAsset.setSecurity_platform_type(asset.getSecurity_platform_type());
              // Dependencies
              List<String> dependencies = new ArrayList<>();
              if (!(asset.getAsset_findings() == null) && !asset.getAsset_findings().isEmpty()) {
                dependencies.addAll(asset.getAsset_findings());
                esAsset.setBase_findings_side(asset.getAsset_findings());
              }
              if (!(asset.getAsset_tags() == null) && !asset.getAsset_tags().isEmpty()) {
                dependencies.addAll(asset.getAsset_tags());
                esAsset.setBase_tags_side(asset.getAsset_tags());
              }
              esAsset.setBase_dependencies(dependencies);
              return esAsset;
            })
        .toList();
  }
}
