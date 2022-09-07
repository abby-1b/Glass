import pygame
# from math import sin

pygame.init()
fpsClock = pygame.time.Clock()

color = (255, 255, 255, 100)
position = (3.5, 100.5)

# CREATING CANVAS
canvas = pygame.display.set_mode((512, 512))

# TITLE OF CANVAS
pygame.display.set_caption("Show Image")

image = pygame.image.load("test.png")

exit = False
frameCount = 0
while not exit:
	frameCount += 1
	canvas.fill(color)

	# size = sin(frameCount / 100) + 1
	rot = pygame.transform.scale2x(image)
	rot = pygame.transform.rotate(rot, frameCount / 2)
	for a in range(2): rot = pygame.transform.scale2x(rot)
	rot = pygame.transform.scale(rot, (512, 512))
	canvas.blit(rot, dest = (0, 0))

	for event in pygame.event.get():
		if event.type == pygame.QUIT: exit = True

	pygame.display.update()

	fpsClock.tick(60)