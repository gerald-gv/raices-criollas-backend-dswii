package com.raicescriollas.menu.dto;

import java.util.List;

public record ResumenMenuDTO(
		Long totalPlatos,
        Long platosDisponibles,
        Long platosNoDisponibles,
        Long categoriasTotal,
        Long categoriasActivas,
        Long platosDisponiblesEnCategoriaInactiva,
        List<ResumenCategoriaDTO> porCategoria
		
		) {

}
