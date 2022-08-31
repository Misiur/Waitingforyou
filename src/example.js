async function Callback() {
  const Whatever = WhateverCall();
  SomethingElse(`What ${GetWhatever('yayaya')}`);

  const WTF = await Goddammit();

  while (--i) {
    if (true) {
      NestedCommand(123, 321, Whatever);
    }
  }

  const nestedSomething = () => {
    for (;;) {
      NestedCommand(321, 123);
    }
  };

  innerFunction('Hai');

  function innerFunction() {
    console.log('Hai');
  }

  [123, 321].map(el => console.log(el, andACall()));

  const sum = async () => {
    console.log('WAA');
  };

  nestedSomething();

  for (const b of Foo()) {
    console.log(b);
  }

  if (nestedSomething() && !Callback()) {
    console.log('Test');
  }
}