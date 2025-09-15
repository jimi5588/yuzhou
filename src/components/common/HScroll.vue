<template>
  <div class="horizontal-scroll-container" ref="container" @mousedown="startDrag" @mousemove="onDrag"
    @mouseup="stopDrag" @mouseleave="stopDrag" @touchstart.passive="startDrag" @touchmove="onDrag" @touchend="stopDrag">
    <div class="scroll-content" :style="{ transform: `translateX(${offsetX}px)` }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const container = ref(null);
    const isDragging = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const offsetX = ref(0);
    const startScrollLeft = ref(0);
    const velocity = ref(0);
    const animationFrame = ref(null);
    const minOffset = ref(0);
    const maxOffset = ref(0);
    const isHorizontal = ref(false); // 新增方向判断标志

    // 初始化边界（修正逻辑）
    const initBounds = () => {
      const containerWidth = container.value?.offsetWidth || 0;
      const contentWidth = container.value?.scrollWidth || 0;

      // 新计算公式
      maxOffset.value = 0;
      minOffset.value = Math.min(containerWidth - contentWidth, 0);

      // 内容不足时完全禁止滑动
      if (contentWidth <= containerWidth) {
        maxOffset.value = 0;
        minOffset.value = 0;
      }
    };

    const inertiaScroll = () => {
      if (!isDragging.value) {
        offsetX.value += velocity.value * 16; // 根据帧时间调整
        velocity.value *= 0.85;

        // 弹性边界处理
        if (offsetX.value > maxOffset.value) {
          offsetX.value = maxOffset.value + (offsetX.value - maxOffset.value) * 0.3;
          velocity.value = 0;
        } else if (offsetX.value < minOffset.value) {
          offsetX.value = minOffset.value + (offsetX.value - minOffset.value) * 0.3;
          velocity.value = 0;
        }

        if (Math.abs(velocity.value) > 0.1) {
          animationFrame.value = requestAnimationFrame(inertiaScroll);
        }
        // 严格边界限制（新增）
        if (offsetX.value > maxOffset.value || offsetX.value < minOffset.value) {
          offsetX.value = Math.max(minOffset.value, Math.min(offsetX.value, maxOffset.value));
          velocity.value = 0;
          return;
        }
      }
    };

    const startDrag = (event) => {
      isDragging.value = true;
      isHorizontal.value = false; // 重置方向标志

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      startX.value = clientX - offsetX.value;
      startY.value = clientY;
      startScrollLeft.value = offsetX.value;
      velocity.value = 0;
      cancelAnimationFrame(animationFrame.value);
    };

    const onDrag = (event) => {
      if (!isDragging.value) return;

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const deltaX = clientX - startX.value - offsetX.value;
      const deltaY = clientY - startY.value;

      // 首次滑动方向判断（新增）
      if (!isHorizontal.value) {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          isDragging.value = false; // 垂直滑动则放弃控制
          return;
        }
        isHorizontal.value = true;
        event.preventDefault(); // 确定水平滑动后才阻止默认
      }

      // 计算速度（优化时间精度）
      const now = performance.now();
      if (onDrag.lastTime) {
        const deltaTime = now - onDrag.lastTime;
        velocity.value = (clientX - (onDrag.lastX || clientX)) / deltaTime;
      }
      onDrag.lastX = clientX;
      onDrag.lastTime = now;

      // 更新位置（带弹性）
      let newOffset = clientX - startX.value;
      if (newOffset > maxOffset.value) {
        newOffset = maxOffset.value + (newOffset - maxOffset.value) * 0.5;
      } else if (newOffset < minOffset.value) {
        newOffset = minOffset.value + (newOffset - minOffset.value) * 0.5;
      }
      offsetX.value = newOffset;
      // 严格位置限制（新增）
      newOffset = Math.max(minOffset.value, Math.min(newOffset, maxOffset.value));

      // 弹性效果优化
      const overflow = newOffset > maxOffset.value
        ? newOffset - maxOffset.value
        : newOffset < minOffset.value
          ? newOffset - minOffset.value
          : 0;

      if (overflow !== 0) {
        newOffset = overflow > 0
          ? maxOffset.value + Math.sqrt(Math.abs(overflow)) * 2
          : minOffset.value - Math.sqrt(Math.abs(overflow)) * 2;
      }

      offsetX.value = newOffset;
    };

    const stopDrag = () => {
      isDragging.value = false;
      if (Math.abs(velocity.value) > 0.5) {
        animationFrame.value = requestAnimationFrame(inertiaScroll);
      }
      onDrag.lastX = null;
      onDrag.lastTime = null;
    };

    onMounted(() => {
      initBounds();
      window.addEventListener('resize', initBounds);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', initBounds);
      cancelAnimationFrame(animationFrame.value);
    });

    return { container, offsetX, startDrag, onDrag, stopDrag };
  },
};
</script>

<style scoped>
.horizontal-scroll-container {
  width: 100%;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
  /* 允许垂直触摸操作 */
  position: relative;
}

.scroll-content {
  display: flex;
  will-change: transform;
  /* 优化动画性能 */
  /* 优化渲染性能 */
  backface-visibility: hidden;
  transform: translateZ(0);

  /* 防止内容换行 */
  flex-wrap: nowrap;
}

.horizontal-scroll-container:active {
  cursor: grabbing;
}
</style>