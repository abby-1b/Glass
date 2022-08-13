#include <iostream>
#include <vector>
#include <string>
struct Test {
	int prop;
};
Test _Test__new__() {
	
};
int Test__prop = 10;
void Test__tst__i32(Test _this, int num) {
	(std::cout << ("Hey!") << "\n");
	(std::cout << (num) << "\n");
	
};
void main__() {
	std::vector<int> arr = std::vector<int>{0, 1, 2};
	(std::cout << ((arr[3])) << "\n");
	
};

int main() { main__(); return 0; }