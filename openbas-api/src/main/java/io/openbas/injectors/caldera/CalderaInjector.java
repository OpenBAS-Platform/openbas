package io.openbas.injectors.caldera;

import io.openbas.database.model.Endpoint;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.integrations.InjectorService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

@Component
@Log
public class CalderaInjector {

    private static final String CALDERA_INJECTOR_NAME = "Caldera";

    @Autowired
    public CalderaInjector(InjectorService injectorService, CalderaContract contract, CalderaInjectorConfig calderaInjectorConfig) {
        Map<String, String> executorCommands = new HashMap<>();
        executorCommands.put(Endpoint.PLATFORM_TYPE.Windows.name(), "$x=\"#{location}\";$location=$x.Replace(\"\\obas.exe\", \"\");[Environment]::CurrentDirectory = $location;$random=-join ((65..90) + (97..122) | Get-Random -Count 5 | % {[char]$_});$filename=\"obas-executor-$random.exe\";$server=\"http://localhost:8888\";$url=\"$server/file/download\";$wc=New-Object System.Net.WebClient;$wc.Headers.add(\"platform\",\"windows\");$wc.Headers.add(\"file\",\"sandcat.go\");$data=$wc.DownloadData($url);[io.file]::WriteAllBytes($filename,$data) | Out-Null;New-NetFirewallRule -DisplayName \"Allow OpenBAS\" -Direction Inbound -Program \"$location\\$filename\" -Action Allow | Out-Null;New-NetFirewallRule -DisplayName \"Allow OpenBAS\" -Direction Outbound -Program \"$location\\$filename\" -Action Allow | Out-Null;Start-Process -FilePath \"$location\\$filename\" -ArgumentList \"-server $server -group red\" -WindowStyle hidden;");
        executorCommands.put(Endpoint.PLATFORM_TYPE.Linux.name(), "x=\"#{location}\";location=$(echo \"$location\" | sed \"s#/obas##\");filename=obas-executor-$(tr -dc A-Za-z0-9 </dev/urandom | head -c 5; echo);server=\"http://localhost:8888\";curl -s -X POST -H \"file:sandcat.go\" -H \"platform:linux\" $server/file/download > $location/$filename;chmod +x $location/$filename;nohup $location/$filename -server $server -group red &");
        executorCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name(), "x=\"#{location}\";location=$(echo \"$location\" | sed \"s#/obas##\");filename=obas-executor-$(tr -dc A-Za-z0-9 </dev/urandom | head -c 5; echo);server=\"http://localhost:8888\";curl -s -X POST -H \"file:sandcat.go\" -H \"platform:darwin\" -H \"architecture:amd64\" $server/file/download > $location/$filename;chmod +x $location/$filename;nohup $location/$filename -server $server -group red &");
        try {
            injectorService.register(
                    calderaInjectorConfig.getId(),
                    CALDERA_INJECTOR_NAME,
                    contract,
                    false,
                    "simulation-agent",
                    executorCommands
            );
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating caldera injector");
        }
    }
}
