defmodule Pirates.GameServer do
  use GenServer
  @moduledoc """
  Functions to handle Pirates game servers.
  """

  @name __MODULE__

  defmodule State do
    @enforce_keys [:id, :pos, :rot]
    defstruct [:id, :pos, :rot]
  end

  ##############
  # Client API #
  ##############

  @doc """
  Starts up a new game server
  """
  def start_link do
    GenServer.start_link(@name, :ok, [])
  end

  @doc """
  Starts up a new game server and registers it under `@name`
  """
  def start_link(:named) do
    GenServer.start_link(@name, :ok, name: @name)
  end

  @doc """
  Registers the calling process on the given game server
  """
  def register(pid \\ @name) do
    GenServer.call(pid, :register)
  end

  @doc """
  Returns the table id of the given game server
  """
  def table(pid \\ @name) do
    GenServer.call(pid, :table)
  end

  @doc """
  Updates state of the calling process in the given table
  """
  def update_state(table, state = %State{}) do
    calling_pid = self()
    case :ets.lookup(table, calling_pid) do
      [{^calling_pid, _}] ->
        :ets.insert(table, {calling_pid, state})
        :ok
      [] ->
        {:error, "#{inspect(calling_pid)} is not registered on this server"}
    end
  end

  @doc """
  Produces a `{pids, states}` tuple from the given ets table
  """
  def state(table) do
    folding_fn = fn
      ({_key, value}, results) when value == %{} ->
        results
      ({pid, state = %State{}}, {pids, states}) ->
        {[pid | pids], [state | states]}
    end
    :ets.foldl(folding_fn, {[], []}, table)
  end

  ####################
  # Server Callbacks #
  ####################

  def init(:ok) do
    opts = [
      :public,
      read_concurrency: true,
      write_concurrency: true
    ]
    table = :ets.new(:states, opts)
    {:ok, table}
  end

  def handle_call(:register, {from_pid, _}, table) do
    if :ets.insert_new(table, {from_pid, %{}}) do
      Process.monitor(from_pid)
      IO.puts "Just registered #{inspect(from_pid)}"
      {:reply, {:ok, table}, table}
    else
      {:reply, {:error, "#{inspect(from_pid)} is already registered on this server"}, table}
    end
  end

  def handle_call(:table, _from, table) do
    {:reply, table, table}
  end

  # handle notifications of dead monitored processes
  def handle_info({:DOWN, _ref, :process, pid, _reason}, table) do
    :ets.delete(table, pid)
    IO.puts "Just deleted state for #{inspect(pid)}"
    {:noreply, table}
  end

  # handle any unexpected mail
  def handle_info(_msg, table) do
    {:noreply, table}
  end
end
