import Acronym from '../Acronym';

describe('Acronym model', () => {
  const mockAdapter = {
    save: jest.fn(v => Promise.resolve(v)),
    delete: jest.fn(v => Promise.resolve(v)),
    read: jest.fn(v => Promise.resolve({def: 'abc'})),
    exist: jest.fn(v => Promise.resolve(true))
  };

  it('has adapter applied', async () => {
    const acronym = new Acronym({
      title: 'sdf',
      teamId: 'telus',
      adapter: mockAdapter
    });
    await acronym.save('service delivery framework');
    expect(mockAdapter.save).toHaveBeenCalledWith({
      team: 'telus',
      title: 'SDF',
      value: 'service delivery framework'
    });
    const isExist = await acronym.exist();
    expect(mockAdapter.exist).toHaveBeenCalledWith('SDF');
    expect(isExist).toBeTruthy();
    const value = await acronym.read();
    expect(mockAdapter.read).toHaveBeenCalledWith('SDF');
    expect(value).toEqual({def: 'abc'});
    await acronym.delete();
    expect(mockAdapter.delete).toHaveBeenCalledWith({"teamId": "telus", "title": "SDF"});
  });

  it('has static helper methods available', () => {
    expect(Acronym.normalize('w-w-f')).toEqual('WWF');
    expect(Acronym.decode('Foo &#xA9; bar')).toEqual('Foo © bar')
    expect(Acronym.getDefineMsg('abc', 'def')).toHaveProperty(['attachments', 0, 'title'], 'Defining: abc')
    expect(Acronym.getDeleteMsg('abc', 'def')).toHaveProperty(['attachments', 0, 'title'], 'Removing: abc')
  })
});
