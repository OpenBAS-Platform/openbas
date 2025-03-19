package io.openbas.injectors.caldera;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Endpoint;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.integrations.InjectorService;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log
public class CalderaInjector {

  private static final String CALDERA_INJECTOR_NAME = "Caldera";

  @Autowired
  public CalderaInjector(
      InjectorService injectorService,
      CalderaContract contract,
      CalderaInjectorConfig calderaInjectorConfig,
      OpenBASConfig openBASConfig) {
    Map<String, String> executorCommands = new HashMap<>();
    executorCommands.put(
        Endpoint.PLATFORM_TYPE.Windows.name() + "." + Endpoint.PLATFORM_ARCH.x86_64,
        "$x=\"#{location}\";$location=$x.Replace(\"\\obas-agent-caldera.exe\", \"\");[Environment]::CurrentDirectory = $location;$filename=\"obas-implant-caldera-#{inject}-agent-#{agent}.exe\";$server=\""
            + calderaInjectorConfig.getPublicUrl()
            + "\";$url=\""
            + openBASConfig.getBaseUrl()
            + "/api/implant/caldera/windows/x86_64\";$wc=New-Object System.Net.WebClient;$data=$wc.DownloadData($url);[io.file]::WriteAllBytes($filename,$data) | Out-Null;Remove-NetFirewallRule -DisplayName \"Allow OpenBAS Inbound\";New-NetFirewallRule -DisplayName \"Allow OpenBAS Inbound\" -Direction Inbound -Program \"$location\\$filename\" -Action Allow | Out-Null;Remove-NetFirewallRule -DisplayName \"Allow OpenBAS Outbound\";New-NetFirewallRule -DisplayName \"Allow OpenBAS Outbound\" -Direction Outbound -Program \"$location\\$filename\" -Action Allow | Out-Null;Start-Process -FilePath \"$location\\$filename\" -ArgumentList \"-server $server -group red\" -WindowStyle hidden;");
    executorCommands.put(
        Endpoint.PLATFORM_TYPE.Linux.name() + "." + Endpoint.PLATFORM_ARCH.x86_64,
        "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");filename=obas-implant-caldera-#{inject}-agent-#{agent};server=\""
            + calderaInjectorConfig.getPublicUrl()
            + "\";curl -s -X GET "
            + openBASConfig.getBaseUrl()
            + "/api/implant/caldera/linux/x86_64 > $location/$filename;chmod +x $location/$filename;$location/$filename -server $server -group red &");
    executorCommands.put(
        Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.x86_64,
        "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");filename=obas-implant-caldera-#{inject}-agent-#{agent};server=\""
            + calderaInjectorConfig.getPublicUrl()
            + "\";curl -s -X GET "
            + openBASConfig.getBaseUrl()
            + "/api/implant/caldera/macos/x86_64 > $location/$filename;chmod +x $location/$filename;$location/$filename -server $server -group red &");
    executorCommands.put(
        Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.arm64,
        "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");filename=obas-implant-caldera-#{inject}-agent-#{agent};server=\""
            + calderaInjectorConfig.getPublicUrl()
            + "\";curl -s -X GET "
            + openBASConfig.getBaseUrl()
            + "/api/implant/caldera/macos/arm64 > $location/$filename;chmod +x $location/$filename;$location/$filename -server $server -group red &");
    Map<String, String> executorClearCommands = new HashMap<>();
    executorClearCommands.put(
        Endpoint.PLATFORM_TYPE.Windows.name() + "." + Endpoint.PLATFORM_ARCH.x86_64,
        "$x=\"#{location}\";$location=$x.Replace(\"\\obas-agent-caldera.exe\", \"\");[Environment]::CurrentDirectory = $location;cd \"$location\";Get-ChildItem -Recurse -Filter *implant* | Remove-Item");
    executorClearCommands.put(
        Endpoint.PLATFORM_TYPE.Linux.name() + "." + Endpoint.PLATFORM_ARCH.x86_64,
        "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");cd \"$location\"; rm *implant*");
    executorClearCommands.put(
        Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.x86_64,
        "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");cd \"$location\"; rm *implant*");
    executorClearCommands.put(
        Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.arm64,
        "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");cd \"$location\"; rm *implant*");
    try {
      injectorService.register(
          calderaInjectorConfig.getId(),
          CALDERA_INJECTOR_NAME,
          contract,
          false,
          "simulation-implant",
          executorCommands,
          executorClearCommands,
          false);
    } catch (Exception e) {
      log.log(
          Level.SEVERE,
          "Error creating Caldera injector ("
              + e.getMessage()
              + ")"
              + "\n"
              + Arrays.toString(e.getStackTrace()));
    }
  }
}
