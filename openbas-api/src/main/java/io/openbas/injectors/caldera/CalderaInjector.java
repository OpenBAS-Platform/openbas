package io.openbas.injectors.caldera;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Endpoint;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.integrations.InjectorService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

@Component
@Log
public class CalderaInjector {

    private static final String CALDERA_INJECTOR_NAME = "Caldera";

    @Autowired
    public CalderaInjector(InjectorService injectorService, CalderaContract contract, CalderaInjectorConfig calderaInjectorConfig, OpenBASConfig openBASConfig) {
        Map<String, String> executorCommands = new HashMap<>();
        executorCommands.put(Endpoint.PLATFORM_TYPE.Windows.name(), "$x=\"#{location}\";$location=$x.Replace(\"\\obas-windows\", \"\");[Environment]::CurrentDirectory = $location;$random=-join ((65..90) + (97..122) | Get-Random -Count 5 | % {[char]$_});$filename=\"obas-executor-$random.exe\";$server=\"" + calderaInjectorConfig.getPublicUrl() + "\";$url=\"" + openBASConfig.getBaseUrl() + "/api/agent/windows\";$wc=New-Object System.Net.WebClient;$wc.Headers.add(\"platform\",\"windows\");$wc.Headers.add(\"file\",\"sandcat.go\");$data=$wc.DownloadData($url);[io.file]::WriteAllBytes($filename,$data) | Out-Null;New-NetFirewallRule -DisplayName \"Allow OpenBAS\" -Direction Inbound -Program \"$location\\$filename\" -Action Allow | Out-Null;New-NetFirewallRule -DisplayName \"Allow OpenBAS\" -Direction Outbound -Program \"$location\\$filename\" -Action Allow | Out-Null;Start-Process -FilePath \"$location\\$filename\" -ArgumentList \"-server $server -group red\" -WindowStyle hidden;");
        executorCommands.put(Endpoint.PLATFORM_TYPE.Linux.name(), "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/obas##\");filename=obas-executor-$(tr -dc A-Za-z0-9 </dev/urandom | head -c 5; echo);server=\"" + calderaInjectorConfig.getPublicUrl() + "\";curl -s -X GET " + openBASConfig.getBaseUrl() + "/api/agent/linux > $location/$filename;chmod +x $location/$filename;$location/$filename -server $server -group red &");
        executorCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name(), "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/obas##\");filename=obas-executor-$(tr -dc A-Za-z0-9 </dev/urandom | head -c 5; echo);server=\"" + calderaInjectorConfig.getPublicUrl() + "\";curl -s -X GET " + openBASConfig.getBaseUrl() + "/api/agent/macos > $location/$filename;chmod +x $location/$filename;$location/$filename -server $server -group red &");
        Map<String, String> executorClearCommands = new HashMap<>();
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.Windows.name(), "$x=\"#{location}\";$location=$x.Replace(\"\\obas-windows\", \"\");[Environment]::CurrentDirectory = $location;cd \"$location\";Get-ChildItem -Recurse -Filter *executor* | Remove-Item");
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.Linux.name(), "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/obas##\");cd \"$location\"; rm *executor*");
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name(), "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/obas##\");cd \"$location\"; rm *executor*");
        try {
            injectorService.register(
                    calderaInjectorConfig.getId(),
                    CALDERA_INJECTOR_NAME,
                    contract,
                    false,
                    "simulation-agent",
                    executorCommands,
                    executorClearCommands
            );
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating Caldera injector (" + e.getMessage() + ")" + "\n" + Arrays.toString(e.getStackTrace()));
        }
    }
}
