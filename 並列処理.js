//一気に全部実行する。
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function parallelTasks() {
    const task1 = async () => {
      console.log('Task 1 started');
      await delay(1000); // 1秒待つ
      console.log('Task 1 completed');
    };
  
    const task2 = async () => {
      console.log('Task 2 started');
      await delay(1000); // 1秒待つ
      console.log('Task 2 completed');
    };
  
    const task3 = async () => {
      console.log('Task 3 started');
      await delay(1000); // 1秒待つ
      console.log('Task 3 completed');
    };
  
    // 並列に実行
    await Promise.all([task1(), task2(), task3()]);
  }
  
  parallelTasks();
  