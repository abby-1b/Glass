#include <iostream>
#include <math.h>
#include <stdlib.h>
#include <vector>
#include <string>
float E = (271828182.0 / 100000000.0);
float randNormal__() {
	return (((static_cast<float>(rand()) / static_cast<float>(RAND_MAX)) * 2.0) - 1.0);
	
};
std::vector<std::vector<std::vector<float>>> randomize__f32$$$(std::vector<std::vector<std::vector<float>>> ws) {
	float b = (1.0 / 100.0);
	return std::vector<std::vector<std::vector<float>>>{std::vector<std::vector<float>>{std::vector<float>{((((ws[0])[0])[0]) + (b * (randNormal__()))), ((((ws[0])[0])[1]) + (b * (randNormal__())))}, std::vector<float>{((((ws[0])[1])[0]) + (b * (randNormal__()))), ((((ws[0])[1])[1]) + (b * (static_cast<float>(rand()) / static_cast<float>(RAND_MAX))))}, std::vector<float>{((((ws[0])[2])[0]) + (b * (static_cast<float>(rand()) / static_cast<float>(RAND_MAX)))), ((((ws[0])[2])[1]) + (b * (static_cast<float>(rand()) / static_cast<float>(RAND_MAX))))}}, std::vector<std::vector<float>>{std::vector<float>{((((ws[1])[0])[0]) + (b * (randNormal__()))), ((((ws[1])[0])[1]) + (b * (randNormal__()))), ((((ws[1])[0])[0]) + (b * (randNormal__())))}}};
	
};
float activation__f32(float v) {
	return (1.0 / ((1.0 + (pow(E, (0.0 - v))))));
	
};
float forward__f32$$$_f32_f32(std::vector<std::vector<std::vector<float>>> ws, float a, float b) {
	std::vector<float> dat = std::vector<float>{a, b};
	dat = std::vector<float>{(activation__f32((((dat[0]) * (((ws[0])[0])[0])) + ((dat[1]) * (((ws[0])[0])[1]))))), (activation__f32((((dat[0]) * (((ws[0])[1])[0])) + ((dat[1]) * (((ws[0])[1])[1]))))), (activation__f32((((dat[0]) * (((ws[0])[2])[0])) + ((dat[1]) * (((ws[0])[2])[1])))))};
	dat = std::vector<float>{(activation__f32(((((dat[0]) * (((ws[1])[0])[0])) + ((dat[1]) * (((ws[1])[0])[1]))) + ((dat[2]) * (((ws[1])[0])[2])))))};
	return (dat[0]);
	
};
float loss__f32$$$(std::vector<std::vector<std::vector<float>>> ws) {
	float l = 0.0;
	float v = 0.0;
	v = (0 - (forward__f32$$$_f32_f32(ws, 0.0, 0.0)));
	l = (l + (v * v));
	v = (1 - (forward__f32$$$_f32_f32(ws, 1.0, 0.0)));
	l = (l + (v * v));
	v = (1 - (forward__f32$$$_f32_f32(ws, 0.0, 1.0)));
	l = (l + (v * v));
	v = (0 - (forward__f32$$$_f32_f32(ws, 1.0, 1.0)));
	l = (l + (v * v));
	return l;
	
};
void main__() {
	std::vector<std::vector<std::vector<float>>> ws = std::vector<std::vector<std::vector<float>>>{std::vector<std::vector<float>>{std::vector<float>{0.0, 0.0}, std::vector<float>{0.0, 0.0}, std::vector<float>{0.0, 0.0}}, std::vector<std::vector<float>>{std::vector<float>{0.0, 0.0, 0.0}}};
	for (int e = 0; (e < 10); e++) {
		std::vector<std::vector<std::vector<float>>> nws = (randomize__f32$$$(ws));
		float oldLoss = (loss__f32$$$(ws));
		float newLoss = (loss__f32$$$(nws));
		if ((newLoss < oldLoss)) {
			ws = nws;
			(std::cout << (newLoss) << "\n");
			
		};
		
	};
	(std::cout << ((activation__f32(0.0))) << "\n");
	
};

int main() { main__(); return 0; }