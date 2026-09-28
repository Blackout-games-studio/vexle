package sk.beton.vexle.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sk.beton.vexle.core.entity.Flag;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlagRepository extends JpaRepository<Flag, Long> {

    @Query(value = "SELECT * FROM flag ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Flag> findRandomFlag();

    @Query(value = """
            SELECT f.* FROM flag f
            JOIN flag_tags ft ON f.id = ft.flag_id
            WHERE ft.tags IN (:tags)
            GROUP BY f.id
            HAVING COUNT(DISTINCT ft.tags) = :tagCount
            ORDER BY RANDOM()
            LIMIT 1
            """, nativeQuery = true)
    Optional<Flag> findRandomFlagByTags(
            @Param("tags") List<String> tags,
            @Param("tagCount") long tagCount
    );

    @Query(value = """
            SELECT f.* FROM flag f
            LEFT JOIN flag_tags ft ON f.id = ft.flag_id
            WHERE (:hasTags = FALSE OR ft.tags IN (:tags))
              AND (:exactColors IS NULL OR f.color_count = :exactColors)
              AND (:minColors IS NULL OR f.color_count >= :minColors)
              AND (:maxColors IS NULL OR f.color_count <= :maxColors)
            GROUP BY f.id
            HAVING :hasTags = FALSE OR COUNT(DISTINCT ft.tags) = :tagCount
            ORDER BY RANDOM()
            LIMIT 1
            """, nativeQuery = true)
    Optional<Flag> findRandomFlagWithFilters(
            @Param("tags") List<String> tags,
            @Param("hasTags") boolean hasTags,
            @Param("tagCount") long tagCount,
            @Param("exactColors") Integer exactColors,
            @Param("minColors") Integer minColors,
            @Param("maxColors") Integer maxColors
    );

    @Query(value = "SELECT * FROM flag ORDER BY id ASC", nativeQuery = true)
    List<Flag> findAllOrderedById();
}