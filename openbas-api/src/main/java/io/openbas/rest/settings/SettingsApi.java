package io.openbas.rest.settings;


import io.openbas.database.model.Setting;
import io.openbas.database.model.Setting.SETTING_KEYS;
import io.openbas.database.repository.SettingRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.settings.form.SettingsUpdateInput;
import io.openbas.rest.settings.response.PlatformSettings;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.openbas.database.model.Setting.SETTING_KEYS.*;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static java.util.Optional.ofNullable;

@RestController
public class SettingsApi extends RestBehavior {

  private SettingRepository settingRepository;

  @Resource
  private PlatformSettingsApi platformSettingsApi;


  @Autowired
  public void setSettingRepository(SettingRepository settingRepository) {
    this.settingRepository = settingRepository;
  }


  private Map<String, Setting> mapOfSettings() {
    return fromIterable(this.settingRepository.findAll()).stream().collect(
        Collectors.toMap(Setting::getKey, Function.identity()));
  }

  private Setting resolveFromMap(Map<String, Setting> dbSettings, SETTING_KEYS setting, String value) {
    Optional<Setting> optionalSetting = ofNullable(dbSettings.get(setting.key()));
    if (optionalSetting.isPresent()) {
      Setting updateSetting = optionalSetting.get();
      updateSetting.setValue(value);
      return updateSetting;
    }
    return new Setting(setting.key(), value);
  }


  @Secured(ROLE_ADMIN)
  @PutMapping("/api/settings")
  public PlatformSettings updateSettings(@Valid @RequestBody SettingsUpdateInput input) {
    Map<String, Setting> dbSettings = mapOfSettings();
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_NAME, input.getName()));
    settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_THEME, input.getTheme()));
    settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_LANG, input.getLang()));
    settingRepository.saveAll(settingsToSave);
    return platformSettingsApi.settings();
  }
}
