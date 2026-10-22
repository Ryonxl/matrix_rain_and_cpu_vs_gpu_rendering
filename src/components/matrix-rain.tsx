import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type MatrixColumn = {
  id: number;
  x: number;
  speed: number;
  glyphSize: number;
  trailLength: number;
  offset: number;
  glyphs: string[];
};

const CHARSET =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

function generateColumn(width: number, height: number, id: number): MatrixColumn {
  const glyphSize = 12 + Math.random() * 10;
  const trailLength = Math.max(10, Math.min(32, Math.floor(height / glyphSize) * 2));

  return {
    id,
    x: Math.random() * width,
    speed: 2 + Math.random() * 7,
    glyphSize,
    trailLength,
    offset: -(Math.random() * height),
    glyphs: Array.from({ length: trailLength }, () => randomChar()),
  };
}

export function MatrixRain() {
  const { width, height } = useWindowDimensions();
  const [columns, setColumns] = useState<MatrixColumn[]>([]);

  useEffect(() => {
    const count = Math.max(14, Math.min(30, Math.floor(width / 18)));
    setColumns((previous) => {
      const nextColumns = Array.from({ length: count }, (_, index) => {
        if (previous[index]) {
          return previous[index];
        }

        return generateColumn(width, height, index);
      });

      return nextColumns;
    });
  }, [width, height]);

  useEffect(() => {
    const animation = setInterval(() => {
      setColumns((previous) =>
        previous.map((column) => {
          const nextOffset = column.offset + column.speed;

          if (nextOffset > height + column.trailLength * column.glyphSize) {
            return generateColumn(width, height, column.id);
          }

          const nextGlyphs = column.glyphs.map((glyph, index) => {
            if (index === 0) {
              return randomChar();
            }

            return glyph;
          });

          const shiftedGlyphs = [randomChar(), ...nextGlyphs.slice(0, -1)];

          return {
            ...column,
            offset: nextOffset,
            glyphs: shiftedGlyphs,
          };
        })
      );
    }, 110);

    return () => clearInterval(animation);
  }, [height, width]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.matrixLayer}>
        {columns.map((column) => {
          return (
            <Animated.View
              key={column.id}
              style={[
                styles.column,
                {
                  left: column.x,
                  transform: [{ translateY: column.offset }],
                },
              ]}>
              {column.glyphs.map((glyph, index) => {
                const opacity = Math.max(0.15, 1 - index / column.trailLength);
                const color =
                  index === 0
                    ? '#f2fff3'
                    : index < 3
                      ? '#8af7b3'
                      : index < 7
                        ? '#4fe78d'
                        : '#21c761';

                return (
                  <Animated.Text
                    key={`${column.id}-${index}`}
                    entering={FadeInUp.duration(160).delay(index * 12)}
                    style={[
                      styles.glyph,
                      {
                        opacity,
                        color,
                        fontSize: column.glyphSize,
                        lineHeight: column.glyphSize + 6,
                      },
                    ]}>
                    {glyph}
                  </Animated.Text>
                );
              })}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020b08',
  },
  matrixLayer: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#020b08',
  },
  column: {
    position: 'absolute',
    top: -80,
    width: 18,
    alignItems: 'center',
  },
  glyph: {
    textShadowColor: '#8ef5ad',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
    includeFontPadding: false,
  },
});
