/**
 * A static object that interacts with other physics objects.
 * Is not affected by gravity or other forces.
 */
class PhysicsObject extends Sprite {}

/**
 * A movable object that interacts with other physics objects.
 * Is affected by gravity and other forces.
*/
class PhysicsBody extends PhysicsObject {
	velocity = new Vec2(0, 0)

	// TODO: implement physics in a loop
	// Also try to figure out how to use delta for physics calculations... Please.
}
