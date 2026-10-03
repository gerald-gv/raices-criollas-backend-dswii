package com.menu.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.menu.dto.PlatoDTO;
import com.menu.entity.Categoria;
import com.menu.entity.Plato;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        // Plato -> PlatoDTO: extraer categoria.id como categoriaId
        mapper.typeMap(Plato.class, PlatoDTO.class).addMappings(m ->
                m.map(src -> src.getCategoria().getId(), PlatoDTO::setCategoriaId)
        );

        // PlatoDTO -> Plato: construir objeto Categoria con solo el id
        mapper.typeMap(PlatoDTO.class, Plato.class).addMappings(m -> {
            m.skip(Plato::setCategoria);
            m.<Long>map(PlatoDTO::getCategoriaId,
                    (dest, v) -> dest.setCategoria(categoriaConId(v)));
        });

        return mapper;
    }

    private Categoria categoriaConId(Long id) {
        Categoria c = new Categoria();
        c.setId(id);
        return c;
    }
}