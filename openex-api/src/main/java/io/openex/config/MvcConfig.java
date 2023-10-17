package io.openex.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.AbstractResourceResolver;
import org.springframework.web.servlet.resource.EncodedResourceResolver;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.NotNull;
import java.util.List;


class ReactIndexResourceResolver extends AbstractResourceResolver {

  @Override
  protected Resource resolveResourceInternal(HttpServletRequest request, @NotNull String requestPath,
      @NotNull List<? extends Resource> locations,
      @NotNull ResourceResolverChain chain) {
    return new ClassPathResource("/build/index.html");
  }

  @Override
  protected String resolveUrlPathInternal(@NotNull String resourceUrlPath,
      @NotNull List<? extends Resource> locations,
      @NotNull ResourceResolverChain chain) {
    return chain.resolveUrlPath(resourceUrlPath, locations);
  }
}

@Configuration
@EnableWebMvc
public class MvcConfig implements WebMvcConfigurer {

  private final static int CACHE_PERIOD = 3600;

  @javax.annotation.Resource
  private ObjectMapper objectMapper;

  @Bean
  public MappingJackson2HttpMessageConverter customJackson2HttpMessageConverter() {
    MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
    jsonConverter.setObjectMapper(this.objectMapper);
    return jsonConverter;
  }

  @Override
  public void configureMessageConverters(List<HttpMessageConverter<?>> messageConverters) {
    //https://springdoc.org/#why-am-i-getting-an-error-swagger-ui-unable-to-render-definition-when-overriding-the-default-spring-registered-httpmessageconverter
    messageConverters.add(new ByteArrayHttpMessageConverter());

    messageConverters.add(new StringHttpMessageConverter());
    messageConverters.add(customJackson2HttpMessageConverter());
  }

  private void addPathStaticResolver(ResourceHandlerRegistry registry, String pattern, String location) {
    registry
        .addResourceHandler(pattern)
        .addResourceLocations(location)
        .setCachePeriod(CACHE_PERIOD)
        .resourceChain(true)
        .addResolver(new EncodedResourceResolver())
        .addResolver(new PathResourceResolver());
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Specific case of react index
    registry.addResourceHandler("*")
        .addResourceLocations("classpath:/build/")
        .setCachePeriod(CACHE_PERIOD)
        .resourceChain(true)
        .addResolver(new EncodedResourceResolver())
        .addResolver(new ReactIndexResourceResolver());
    // React statics
    addPathStaticResolver(registry, "/static/**", "classpath:/build/static/");
    // Specific application images
    addPathStaticResolver(registry, "/media/**", "classpath:/build/static/media/");
  }
}
